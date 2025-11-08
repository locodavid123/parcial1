import { NextResponse } from 'next/server';
import { getDatabase } from '@/app/config/couchdb';

/**
 * Genera un reporte de stock en formato CSV.
 * @param {Request} request - La solicitud HTTP.
 * @returns {NextResponse} - Una respuesta con el archivo CSV.
 */
export async function GET(request) {
    try {
        const db = await getDatabase();
        
        // Obtener todos los productos de la base de datos
        const response = await db.products.list({ include_docs: true });
        const products = response.rows.map(row => row.doc);

        // Encabezados del CSV
        const headers = [
            "ID Producto",
            "Nombre",
            "Descripción",
            "Precio",
            "Stock"
        ];

        let csvContent = headers.join(",") + "\n";

        // Construir las filas del CSV
        products.forEach(product => {
            const row = [product._id, product.nombre, `"${product.descripcion}"`, product.precio, product.stock].join(",");
            csvContent += row + "\n";
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="reporte_stock.csv"',
            },
        });

    } catch (error) {
        console.error('Error generando reporte de stock:', error);
        return NextResponse.json({ message: 'Error interno del servidor al generar el reporte.' }, { status: 500 });
    }
}