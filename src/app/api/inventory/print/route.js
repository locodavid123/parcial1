import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import puppeteer from 'puppeteer';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('productos').find({}).toArray();

    // 1. Generar el contenido HTML para el PDF
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            h1 { text-align: center; color: #1a202c; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: middle; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
            .price, .stock { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Reporte de Inventario</h1>
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="stock">Stock</th>
                <th class="price">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>
                    ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.nombre || ''}">` : '<span>Sin imagen</span>'}
                  </td>
                  <td>${product.nombre || 'Sin nombre'}</td>
                  <td>${product.descripcion || 'Sin descripción'}</td>
                  <td class="stock">${product.stock ?? 0}</td>
                  <td class="price">$${product.precio ? parseFloat(product.precio).toFixed(2) : '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // 2. Usar Puppeteer para convertir el HTML a PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 3. Devolver el buffer del PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-inventario.pdf"',
      },
    });

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return NextResponse.json({ message: 'Error al generar el PDF', error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}