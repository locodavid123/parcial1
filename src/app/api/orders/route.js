import { NextResponse } from 'next/server';
import getDatabase from '@/app/config/couchdb';

// Nota: Esta implementación usa CouchDB (nano) en lugar de la API de MongoDB.
// El archivo original estaba escrito para MongoDB (getClient/getDb, transacciones).
// Aquí proporciono una versión adaptada a CouchDB sin transacciones (CouchDB no tiene transacciones multi-doc).

function safeId(id) {
    if (!id) return null;
    return String(id);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id');
    const estatus = searchParams.get('estatus');

    try {
        const db = await getDatabase();

        // 1. Obtener todos los pedidos y clientes en paralelo
        const [ordersResponse, clientsResponse] = await Promise.all([
            db.orders.list({ include_docs: true }),
            db.clients.list({ include_docs: true })
        ]);

        // 2. Crear un mapa de clientes para búsqueda eficiente
        const clientsMap = new Map(clientsResponse.rows.map(row => [row.doc._id, row.doc]));

        let orders = ordersResponse.rows.map(row => row.doc);

        // 3. Unir la información del cliente a cada pedido
        orders = orders.map(order => ({
            ...order,
            cliente: clientsMap.get(order.cliente_id) || null
        }));

        // 4. Aplicar filtros si existen
        if (estatus) {
            orders = orders.filter(order => String(order.estatus || '').toLowerCase() === String(estatus).toLowerCase());
        }

        if (clienteId) {
            // El clienteId que llega es el `usuario_id`
            orders = orders.filter(order => String(order.cliente?.usuario_id || '') === String(clienteId));
        }

        // 5. Ordenar por fecha descendente
        orders.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

        return NextResponse.json(orders);

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return NextResponse.json({ message: 'Error al obtener los pedidos', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const { cliente_id, cliente_info, productos } = await request.json();

    if (!cliente_id || !Array.isArray(productos)) {
        return NextResponse.json({ message: 'Parámetros inválidos' }, { status: 400 });
    }

    try {
        const db = await getDatabase();

        // 1) Buscar o crear cliente en CouchDB
        const clientsResp = await db.clients.list({ include_docs: true });
        let cliente = clientsResp.rows.map(r => r.doc).find(c => String(c.usuario_id) === String(cliente_id));

        if (!cliente) {
            const nuevo = {
                nombre: cliente_info?.nombre || '',
                correo: cliente_info?.correo || '',
                telefono: cliente_info?.telefono || '',
                usuario_id: String(cliente_id),
                createdAt: new Date().toISOString(),
            };
            const insertRes = await db.clients.insert(nuevo);
            cliente = { ...nuevo, _id: insertRes.id, _rev: insertRes.rev };
        }

        // 2) Validar productos y calcular total
        const productIds = productos.map(p => safeId(p.producto_id));
        const productDocs = await db.products.fetch({ keys: productIds });
        const productsMap = new Map(productDocs.rows.map(r => [r.key, r.doc]));

        let total = 0;
        const detalles = [];

        for (const p of productos) {
            const prodId = safeId(p.producto_id);
            const prod = productsMap.get(prodId);

            if (!prod) return NextResponse.json({ message: `Producto ${prodId} no encontrado` }, { status: 400 });

            const cantidad = Number(p.cantidad || 0);
            if ((prod.stock || 0) < cantidad) return NextResponse.json({ message: `Stock insuficiente para ${prod.nombre}` }, { status: 400 });

            total += (prod.precio || 0) * cantidad;
            detalles.push({ producto_id: prod._id, cantidad, precio_unitario: prod.precio || 0 });
        }

        // 3) Crear documento de pedido
        const pedido = {
            cliente_id: cliente._id,
            fecha: new Date().toISOString(),
            total,
            estatus: 'pendiente',
            detalles,
        };
        const createRes = await db.orders.insert(pedido);

        // 4) Actualizar stock (no es transaccional en CouchDB)
        for (const item of detalles) {
            const prodDoc = await db.products.get(String(item.producto_id));
            prodDoc.stock = (prodDoc.stock || 0) - item.cantidad;
            await db.products.insert({ ...prodDoc, _id: prodDoc._id, _rev: prodDoc._rev });
        }

        return NextResponse.json({ message: 'Pedido creado exitosamente', pedidoId: createRes.id }, { status: 201 });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id || !status) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

    try {
        const db = await getDatabase();
        const pedido = await db.orders.get(String(id));

        const prevStatus = String(pedido.estatus || '').toLowerCase();
        const newStatus = String(status).toLowerCase();

        if (newStatus === 'cancelado' && prevStatus !== 'cancelado') {
            for (const item of pedido.detalles || []) {
                const prodDoc = await db.products.get(String(item.producto_id));
                prodDoc.stock = (prodDoc.stock || 0) + (item.cantidad || 0);
                await db.products.insert({ ...prodDoc, _id: prodDoc._id, _rev: prodDoc._rev });
            }
        }

        pedido.estatus = newStatus;
        const res = await db.orders.insert({ ...pedido, _id: pedido._id, _rev: pedido._rev });

        return NextResponse.json({ ...pedido, _rev: res.rev });
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        return NextResponse.json({ message: error.message }, { status: error.statusCode || 500 });
    }
}