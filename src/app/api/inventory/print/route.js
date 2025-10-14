import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error('❌ Faltan variables de entorno MONGODB_URI o MONGODB_DB.');
    return NextResponse.json({ message: 'Faltan variables de entorno para MongoDB' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  let browser;

  const isLocal = process.env.NODE_ENV === 'development';
  console.log(`🌍 Entorno detectado: ${isLocal ? 'Desarrollo (Local)' : 'Producción (Vercel)'}`);

  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('productos').find({}).toArray();
    console.log(`📦 Productos encontrados: ${products.length}`);

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
              ${products.map(p => `
                <tr>
                  <td>${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.nombre || ''}">` : '<span>Sin imagen</span>'}</td>
                  <td>${p.nombre || 'Sin nombre'}</td>
                  <td>${p.descripcion || 'Sin descripción'}</td>
                  <td class="stock">${p.stock ?? 0}</td>
                  <td class="price">$${p.precio ? parseFloat(p.precio).toFixed(2) : '0.00'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    console.log('🧠 Inicializando Puppeteer...');
    const executablePath = isLocal
      ? process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome'
      : await chromium.executablePath();

    if (!executablePath) {
      throw new Error('No se pudo determinar el ejecutable de Chromium en producción.');
    }

    const launchOptions = isLocal
      ? { headless: true, executablePath, args: [] }
      : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        };

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    console.log('✅ PDF generado con éxito.');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-inventario.pdf"',
      },
    });
  } catch (error) {
    console.error('❌ Error al generar el PDF:', error);
    return NextResponse.json({ message: 'Error al generar el PDF', error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close().catch(() => {});
    await client.close().catch(() => {});
  }
}