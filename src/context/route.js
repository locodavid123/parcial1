import { NextResponse } from 'next/server';
import { getDb, getClient } from '@/app/config/mongo';
import { ObjectId } from 'mongodb';

function toObjectId(id) {
  try { return new ObjectId(id); } catch (e) { return null; }
}

// GET all orders
export async function GET() {
    try {
        const db = await getDb();
        const pipeline = [
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
        const result = await db.collection('pedidos').aggregate(pipeline).toArray();
        return NextResponse.json(result, { next: { revalidate: 0 } });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ message: "Error al obtener los pedidos." }, { status: 500 });
    }
}

// POST a new order
export async function POST(request) {
    const { cliente_info, total, items } = await request.json();

    if (!cliente_info || !cliente_info.id || !cliente_info.correo || !total || !items || items.length === 0) {
        return NextResponse.json({ message: "Datos del pedido o del cliente incompletos." }, { status: 400 });
    }

    const client = await getClient();
    const session = client.startSession();

    try {
        let pedidoId;
        await session.withTransaction(async () => {
            const db = await getDb();
            const clientesCol = db.collection('clientes');
            const pedidosCol = db.collection('pedidos');

            let cliente = await clientesCol.findOne({ correo: cliente_info.correo }, { session });
            if (!cliente) {
                const newClient = { nombre: cliente_info.nombre, correo: cliente_info.correo, createdAt: new Date() };
                const r = await clientesCol.insertOne(newClient, { session });
                cliente = { _id: r.insertedId, ...newClient };
            }

            const pedidoDoc = { cliente_id: cliente._id, total, productos: items.map(it => ({ producto_id: toObjectId(it.id), cantidad: it.quantity, precio_unitario: it.precio })), createdAt: new Date() };
            const pr = await pedidosCol.insertOne(pedidoDoc, { session });
            pedidoId = pr.insertedId;
        });

        return NextResponse.json({ message: "Pedido creado exitosamente", pedido_id: pedidoId }, { status: 201 });
    } catch (error) {
        console.error("Error al crear el pedido:", error);
        return NextResponse.json({ message: "Error interno del servidor al crear el pedido." }, { status: 500 });
    } finally {
        await session.endSession();
    }
}

// PUT (update) an order status
export async function PUT(request) {
    const { id, status } = await request.json();
    if (!id || !status) {
        return NextResponse.json({ message: "Falta el ID o el nuevo estado del pedido." }, { status: 400 });
    }
    try {
        const db = await getDb();
        const result = await db.collection('pedidos').findOneAndUpdate({ _id: toObjectId(id) }, { $set: { status, updatedAt: new Date() } }, { returnDocument: 'after' });
        if (!result.value) return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
        return NextResponse.json(result.value);
    } catch (error) {
        return NextResponse.json({ message: "Error al actualizar el pedido." }, { status: 500 });
    }
}

// DELETE an order
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: "Falta el ID del pedido." }, { status: 400 });

    const client = await getClient();
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            const db = await getDb();
            await db.collection('pedidos').deleteOne({ _id: toObjectId(id) }, { session });
        });
        return NextResponse.json({ message: "Pedido eliminado exitosamente" });
    } catch (error) {
        return NextResponse.json({ message: "Error al eliminar el pedido." }, { status: 500 });
    } finally {
        await session.endSession();
    }
}