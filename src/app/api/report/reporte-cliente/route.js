import { NextResponse } from 'next/server';
import { getDatabase } from '@/app/config/couchdb';
import ExcelJS from 'exceljs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ message: 'Se requiere un nombre o ID de cliente.' }, { status: 400 });
        }

        const db = await getDatabase();
        const clientsResponse = await db.clients.list({ include_docs: true });
        
        const client = clientsResponse.rows
            .map(r => r.doc)
            .find(c => c._id === query || (c.nombre && c.nombre.toLowerCase().includes(query.toLowerCase())));

        if (!client) {
            return NextResponse.json({ message: `No se encontró un cliente con "${query}".` }, { status: 404 });
        }

        const ordersResponse = await db.orders.list({ include_docs: true });
        const clientOrders = ordersResponse.rows
            .map(r => r.doc)
            .filter(order => order.cliente_id === client._id);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Compras de ${client.nombre}`);

        worksheet.columns = [
            { header: 'ID Pedido', key: 'id', width: 30 },
            { header: 'Fecha', key: 'date', width: 20 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Total', key: 'total', width: 15, style: { numFmt: '"$"#,##0.00' } },
        ];

        worksheet.addRow([`Reporte de Compras para: ${client.nombre} (ID: ${client._id})`]).font = { bold: true, size: 14 };
        worksheet.mergeCells('A1:D1');
        worksheet.addRow([]);

        let totalPurchased = 0;

        clientOrders.forEach(order => {
            worksheet.addRow({
                id: order._id,
                date: new Date(order.fecha).toLocaleDateString(),
                status: order.estatus,
                total: order.total,
            });
            if (order.estatus !== 'cancelado') {
                totalPurchased += order.total;
            }
        });

        worksheet.addRow([]);
        const totalRow = worksheet.addRow({ total: totalPurchased });
        totalRow.getCell('C').value = 'Total Comprado (no cancelado):';
        totalRow.getCell('C').font = { bold: true };
        totalRow.getCell('D').font = { bold: true };

        worksheet.getRow(3).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="compras_${client.nombre.replace(/\s/g, '_')}.xlsx"`,
            },
        });

    } catch (error) {
        console.error('Error generando reporte de cliente:', error);
        return NextResponse.json({ message: 'Error al generar el reporte del cliente.' }, { status: 500 });
    }
}