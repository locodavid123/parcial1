import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('productos').find({}).toArray();

    // Función para obtener la imagen como base64
    const getImageAsBase64 = async (url) => {
      if (!url) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      } catch (error) {
        console.warn(`No se pudo cargar la imagen desde ${url}:`, error.message);
        return null;
      }
    };

    const productsWithBase64Images = await Promise.all(products.map(async (product) => ({ ...product, imageBase64: await getImageAsBase64(product.imageUrl) })));

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
              ${productsWithBase64Images.map(product => `
                <tr>
                  <td>
                    ${product.imageBase64 ? `<img src="${product.imageBase64}" alt="${product.nombre || ''}">` : '<span>Sin imagen</span>'}
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

    // 2. Configurar Puppeteer para usar Chrome local en desarrollo y Chromium en producción (Vercel).
    let executablePath = '';
    if (process.env.NODE_ENV === 'production') {
      // En producción (Vercel), siempre usamos @sparticuz/chromium
      executablePath = await chromium.executablePath();
    } else {
      // En desarrollo, intentamos usar una instalación local de Chrome.
      // Esto es más rápido que descargar Chromium cada vez.
      const { findChrome } = await import('find-chrome-bin');
      const chromeInfo = await findChrome();
      executablePath = chromeInfo.executablePath;
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
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