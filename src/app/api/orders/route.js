import { NextResponse } from 'next/server';
import { ObjectId, Int32 } from 'mongodb';
import getDb, { getClient } from '@/app/config/mongo';
import { create as createClient } from '@/models/Client'; // Importar el modelo de Cliente

function toObjectId(id) {
    try {
        return new ObjectId(id);
    } catch (e) {
        return null;
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id'); // este es usuario_id (id del usuario)

    try {
        const db = await getDb();

        // Si se proporciona clienteId (usuario_id), buscamos clientes con ese usuario_id
        let match = {};
        if (clienteId) {
            const clientes = await db.collection('clientes').find({ usuario_id: clienteId }).project({ _id: 1 }).toArray();
            const clienteIds = clientes.map(c => c._id);
            if (clienteIds.length === 0) {
                return NextResponse.json([]);
            }
            match = { cliente_id: { $in: clienteIds } };
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'clientes',
                    localField: 'cliente_id',
                    foreignField: '_id',
                    as: 'cliente'
                }
            },
            { $unwind: { path: '$cliente', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ];

        const pedidos = await db.collection('pedidos').aggregate(pipeline).toArray();
        return NextResponse.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return NextResponse.json({ message: 'Error al obtener los pedidos', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const { cliente_id, cliente_info, productos } = await request.json();
    const client = await getClient();
    const session = client.startSession();

    try {
        const db = await getDb();
        let resultPedido;

        await session.withTransaction(async () => {
            const clientesCol = db.collection('clientes');
            const productosCol = db.collection('productos');
            const pedidosCol = db.collection('pedidos');

            // 1. Verificar si existe cliente vinculado al usuario
            let cliente = await clientesCol.findOne({ usuario_id: cliente_id }, { session });
            if (!cliente) {
                const nuevo = {
                    nombre: cliente_info.nombre,
                    correo: cliente_info.correo,
                    telefono: cliente_info.telefono || '',
                    usuario_id: cliente_id,
                    createdAt: new Date()
                };
                const insertRes = await clientesCol.insertOne(nuevo, { session });
                cliente = { _id: insertRes.insertedId, ...nuevo };
            }

            // 2. Obtener precios y comprobar stock
            const productIds = productos.map(p => toObjectId(p.producto_id)).filter(Boolean);
            const prodsFromDb = await productosCol.find({ _id: { $in: productIds } }, { session }).toArray();

            let totalCalculado = 0;
            const productosConPrecioDB = productos.map((p) => {
                const prod = prodsFromDb.find(dbp => dbp._id.equals(toObjectId(p.producto_id)));
                if (!prod) throw new Error(`Producto con ID ${p.producto_id} no encontrado.`);
                if ((prod.stock || 0) < p.cantidad) throw new Error(`Stock insuficiente para "${prod.nombre || prod._id}". Disponible: ${prod.stock || 0}, Solicitado: ${p.cantidad}.`);
                totalCalculado += (prod.precio || 0) * p.cantidad;
                return { producto_id: prod._id, cantidad: p.cantidad, precio_unitario: prod.precio || 0 };
            });

            // 3. Crear pedido
            const pedidoDoc = {
                cliente_id: cliente._id,
                total: totalCalculado,
                status: 'Pendiente',
                productos: productosConPrecioDB,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const pedidoInsert = await pedidosCol.insertOne(pedidoDoc, { session });

            // 4. Actualizar stock
            for (const item of productosConPrecioDB) {
                await productosCol.updateOne({ _id: item.producto_id }, { $inc: { stock: -item.cantidad } }, { session });
            }

            resultPedido = { pedidoId: pedidoInsert.insertedId, clienteId: cliente._id };
        });

        return NextResponse.json({ message: 'Pedido creado exitosamente', ...resultPedido }, { status: 201 });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        await session.endSession();
    }
}

export async function PUT(request) {
    const { id, status } = await request.json();
    const client = await getClient();
    const session = client.startSession();

    try {
        const db = await getDb();
        let updatedPedido;

        await session.withTransaction(async () => {
            const pedidosCol = db.collection('pedidos');
            const productosCol = db.collection('productos');

            if (status === 'Cancelado') {
                // devolver stock
                const pedido = await pedidosCol.findOne({ _id: toObjectId(id) }, { session });
                if (!pedido) throw new Error('Pedido no encontrado');
                for (const item of pedido.productos || []) {
                    await productosCol.updateOne({ _id: item.producto_id }, { $inc: { stock: item.cantidad } }, { session });
                }
            }

            const res = await pedidosCol.findOneAndUpdate(
                { _id: toObjectId(id) },
                { $set: { status, updatedAt: new Date() } },
                { returnDocument: 'after', session }
            );

            if (!res.value) throw new Error('Pedido no encontrado');
            updatedPedido = res.value;
        });

        return NextResponse.json(updatedPedido);
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        await session.endSession();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const client = await getClient();
    const session = client.startSession();

    try {
        const db = await getDb();
        await session.withTransaction(async () => {
            const pedidosCol = db.collection('pedidos');
            const productosCol = db.collection('productos');

            const pedido = await pedidosCol.findOne({ _id: toObjectId(id) }, { session });
            if (!pedido) throw new Error('Pedido no encontrado');

            // devolver stock
            for (const item of pedido.productos || []) {
                await productosCol.updateOne({ _id: item.producto_id }, { $inc: { stock: item.cantidad } }, { session });
            }

            // eliminar pedido
            await pedidosCol.deleteOne({ _id: toObjectId(id) }, { session });
        });

        return NextResponse.json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        await session.endSession();
    }
}