import { NextResponse } from 'next/server';
import { getDatabase } from '@/app/config/couchdb';

/**
 * Genera un reporte de ventas en formato CSV.
 * @param {Request} request - La solicitud HTTP.
 * @returns {NextResponse} - Una respuesta con el archivo CSV.
 */
export async function GET(request) {
    try {
        const db = await getDatabase();
        
        // 1. Obtener todos los pedidos y clientes en paralelo
        const [ordersResponse, clientsResponse] = await Promise.all([
            db.orders.list({ include_docs: true }),
            db.clients.list({ include_docs: true })
        ]);

        // 2. Crear un mapa de clientes para una búsqueda eficiente
        const clientsMap = new Map(clientsResponse.rows.map(row => [row.doc._id, row.doc]));

        let orders = ordersResponse.rows.map(row => row.doc);

        // 3. Unir la información del cliente a cada pedido
        orders = orders.map(order => ({
            ...order,
            cliente: clientsMap.get(order.cliente_id) || null
        }));

        // Encabezados del CSV
        const headers = [
            "ID Pedido",
            "ID Cliente",
            "Nombre Cliente",
            "Correo Cliente",
            "Fecha",
            "Estatus",
            "Total",
            "ID Producto",
            "Cantidad",
            "Precio Unitario"
        ];

        let csvContent = headers.join(",") + "\n";

        // Construir las filas del CSV
        orders.forEach(order => {
            order.detalles.forEach(item => {
                const row = [
                    order._id,
                    order.cliente_id,
                    order.cliente?.nombre || 'N/A',
                    order.cliente?.correo || 'N/A',
                    new Date(order.fecha).toLocaleDateString(),
                    order.estatus,
                    order.total,
                    item.producto_id,
                    item.cantidad,
                    item.precio_unitario
                ].join(",");
                csvContent += row + "\n";
            });
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="reporte_ventas.csv"',
            },
        });

    } catch (error) {
        console.error('Error generando reporte de ventas:', error);
        return NextResponse.json({ message: 'Error interno del servidor al generar el reporte.' }, { status: 500 });
    }
}
