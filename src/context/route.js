import pool from "@/app/config/db";
import { NextResponse } from "next/server";

// GET all orders
export async function GET() {
    try {
        const query = `
            SELECT 
                p.id, 
                p.fecha, 
                p.total, 
                p.status, 
                c.nombre as cliente_nombre, 
                c.correo as cliente_correo 
            FROM pedidos p 
            JOIN clientes c ON p.cliente_id = c.id 
            ORDER BY p.fecha DESC
        `;
        const result = await pool.query(query);
        return NextResponse.json(result.rows, { next: { revalidate: 0 } });
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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let clienteId;
        const findClientRes = await client.query("SELECT id FROM clientes WHERE correo = $1", [cliente_info.correo]);
        
        if (findClientRes.rows.length > 0) {
            clienteId = findClientRes.rows[0].id;
        } else {
            const newClientRes = await client.query(
                "INSERT INTO clientes (nombre, correo) VALUES ($1, $2) RETURNING id",
                [cliente_info.nombre, cliente_info.correo]
            );
            clienteId = newClientRes.rows[0].id;
        }

        const pedidoRes = await client.query(
            "INSERT INTO pedidos (cliente_id, total, fecha) VALUES ($1, $2, NOW()) RETURNING id",
            [clienteId, total]
        );
        const pedido_id = pedidoRes.rows[0].id;

        const detallePromises = items.map(item => {
            return client.query(
                "INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
                [pedido_id, item.id, item.quantity, item.precio]
            );
        });
        await Promise.all(detallePromises);

        await client.query('COMMIT');

        return NextResponse.json({ message: "Pedido creado exitosamente", pedido_id: pedido_id }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al crear el pedido:", error);
        return NextResponse.json({ message: "Error interno del servidor al crear el pedido." }, { status: 500 });
    } finally {
        client.release();
    }
}

// PUT (update) an order status
export async function PUT(request) {
    const { id, status } = await request.json();
    if (!id || !status) {
        return NextResponse.json({ message: "Falta el ID o el nuevo estado del pedido." }, { status: 400 });
    }
    try {
        const result = await pool.query("UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
        if (result.rowCount === 0) return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ message: "Error al actualizar el pedido." }, { status: 500 });
    }
}

// DELETE an order
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: "Falta el ID del pedido." }, { status: 400 });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query("DELETE FROM pedidos_detalle WHERE pedido_id = $1", [id]);
        await client.query("DELETE FROM pedidos WHERE id = $1", [id]);
        await client.query('COMMIT');
        return NextResponse.json({ message: "Pedido eliminado exitosamente" });
    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: "Error al eliminar el pedido." }, { status: 500 });
    } finally {
        client.release();
    }
}