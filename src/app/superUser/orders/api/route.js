import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { renderToStaticMarkup } from 'react-dom/server';
import path from 'path';
import fs from 'fs/promises';
import * as Product from '@/models/Product';
import InventoryReport from '@/components/inventory/InventoryReport';

export async function GET() {
    try {
        // 1. Obtener todos los productos de la base de datos
        const products = await Product.findAll();

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No hay productos en el inventario.' }, { status: 404 });
        }

        // 2. Renderizar el componente de React a una cadena de HTML estático
        const htmlContent = renderToStaticMarkup(<InventoryReport products={products} />);

        // 3. Definir la ruta y el nombre del archivo
        const reportsDir = path.join(process.cwd(), 'public', 'reports');
        await fs.mkdir(reportsDir, { recursive: true }); // Asegurarse de que el directorio exista
        const filePath = path.join(reportsDir, `reporte-inventario-${Date.now()}.pdf`);
        const publicPath = `/reports/${path.basename(filePath)}`;

        // 4. Usar Puppeteer-core para generar y guardar el PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            // ¡Importante! Aquí le decimos a puppeteer-core dónde encontrar Chrome.
            // Esta es la ruta más común en Windows. Si no funciona, ajústala a tu instalación.
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        await browser.close();

        // 5. Devolver la ruta del archivo generado
        return NextResponse.json({ success: true, filePath: publicPath });

    } catch (error) {
        console.error('Error al generar el reporte de inventario:', error);
        return NextResponse.json({ message: 'Error interno al generar el reporte.' }, { status: 500 });
    }
}