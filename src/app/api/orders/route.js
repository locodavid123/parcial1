import pool from "@/app/config/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('cliente_id');

    try {
        let query;
        let params;

        if (clienteId) {
            // Consulta para un cliente específico
            query = `
                SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
                FROM pedidos p
                JOIN clientes c ON p.cliente_id = c.id
                WHERE c.usuario_id = $1
                ORDER BY p.fecha DESC
            `;
            params = [clienteId];
        } else {
            // Consulta para obtener todos los pedidos (para el admin)
            query = `
                SELECT p.*, c.nombre as cliente_nombre, c.correo as cliente_correo
                FROM pedidos p
                JOIN clientes c ON p.cliente_id = c.id
                ORDER BY p.fecha DESC
            `;
            params = [];
        }

        const result = await pool.query(query, params);

        // Si no se encuentran pedidos para un cliente específico, devolver un array vacío en lugar de 404
        if (clienteId && result.rows.length === 0) {
            return NextResponse.json([]);
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        return NextResponse.json({ message: "Error al obtener los pedidos", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const { cliente_id, cliente_info, productos } = await request.json();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verificar si el cliente ya existe en la tabla 'clientes'
        let clienteExistente = await client.query('SELECT id FROM clientes WHERE usuario_id = $1', [cliente_id]);
        let finalClientId;

        if (clienteExistente.rows.length > 0) {
            finalClientId = clienteExistente.rows[0].id;
        } else {
            // Si no existe, lo creamos y lo vinculamos al usuario.
            const nuevoCliente = await client.query('INSERT INTO clientes (nombre, correo, telefono, usuario_id) VALUES ($1, $2, $3, $4) RETURNING id', [
                cliente_info.nombre,
                cliente_info.correo,
                cliente_info.telefono || '', // CORREGIDO: Usar el teléfono del cliente_info
                cliente_id,
            ]);
            finalClientId = nuevoCliente.rows[0].id;
        }

        // 2. Obtener precios de la DB y calcular el total para seguridad
        const productIds = productos.map((p) => p.producto_id);
        const pricesRes = await client.query('SELECT id, nombre, precio, stock FROM productos WHERE id = ANY($1::int[])', [ // CORREGIDO: Se añade 'nombre' para el mensaje de error.
            productIds
        ]);

        let totalCalculado = 0;
        const productosConPrecioDB = productos.map((p) => {
            const productFromDB = pricesRes.rows.find((dbProd) => dbProd.id === p.producto_id);
            if (!productFromDB) throw new Error(`Producto con ID ${p.producto_id} no encontrado.`);
            if (productFromDB.stock < p.cantidad) throw new Error(`Stock insuficiente para "${productFromDB.nombre}". Disponible: ${productFromDB.stock}, Solicitado: ${p.cantidad}.`); // CORREGIDO: Mensaje de error mejorado.
            totalCalculado += productFromDB.precio * p.cantidad;
            return {
                ...p,
                precio_unitario: productFromDB.precio,
            };
        });

        // 3. Crear el pedido
        const pedidoRes = await client.query(
            'INSERT INTO pedidos (cliente_id, total, status) VALUES ($1, $2, $3) RETURNING id', // CORREGIDO: Se añade el estado 'Pendiente'
            [finalClientId, totalCalculado, 'Pendiente'] // CORREGIDO: Se añade el estado 'Pendiente'
        );
        const pedidoId = pedidoRes.rows[0].id;

        // 4. Insertar los detalles del pedido y actualizar stock
        for (const producto of productosConPrecioDB) {
            // Insertar detalle
            await client.query(
                'INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, producto.producto_id, producto.cantidad, producto.precio_unitario]
            );
            // Actualizar stock explícitamente (más seguro que depender solo del trigger)
            await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [producto.cantidad, producto.producto_id]);
        }

        await client.query('COMMIT');
        return NextResponse.json({ message: 'Pedido creado exitosamente', pedidoId: pedidoId, clienteId: finalClientId }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al crear el pedido:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request) {
    const client = await pool.connect();
    const { id, status } = await request.json();

    try {
        await client.query('BEGIN');

        // Si el nuevo estado es 'Cancelado', devolvemos los productos al stock.
        if (status === 'Cancelado') {
            const itemsToReturn = await client.query('SELECT producto_id, cantidad FROM pedidos_detalle WHERE pedido_id = $1', [id]);

            for (const item of itemsToReturn.rows) {
                await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.producto_id]);
            }
        }

        // Actualizamos el estado del pedido.
        const result = await pool.query(
            "UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
        }

        await client.query('COMMIT');
        return NextResponse.json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al actualizar el pedido:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener los productos del pedido para devolverlos al stock.
        const itemsToReturn = await client.query('SELECT producto_id, cantidad FROM pedidos_detalle WHERE pedido_id = $1', [id]);

        // 2. Devolver cada producto al stock.
        for (const item of itemsToReturn.rows) {
            await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.producto_id]);
        }

        // 3. Eliminar detalles del pedido.
        await client.query("DELETE FROM pedidos_detalle WHERE pedido_id = $1", [id]);

        // 4. Eliminar el pedido principal.
        const result = await client.query("DELETE FROM pedidos WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
        }

        await client.query('COMMIT');
        return NextResponse.json({ message: "Pedido eliminado exitosamente" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al eliminar el pedido:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}