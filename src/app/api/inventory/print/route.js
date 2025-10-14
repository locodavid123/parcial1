import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// 👇 Desactivar Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
  console.log('🧠 [Inicio] Generando reporte de inventario...');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error('❌ Faltan variables de entorno MONGODB_URI o MONGODB_DB');
    return NextResponse.json({ message: 'Faltan variables de entorno' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  let browser;

  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    const db = client.db(dbName);
    const productos = await db.collection('productos').find({}).toArray();
    console.log(`✅ Productos encontrados: ${productos.length}`);

    // --- HTML para el PDF ---
    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            h1 { text-align: center; color: #1a202c; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
            .price, .stock { text-align: right; }
          </style>
        </head>
        <body>
          <h1>📦 Reporte de Inventario</h1>
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productos
                .map(
                  (p) => `
                    <tr>
                      <td>${p.imageUrl ? `<img src="${p.imageUrl}">` : 'Sin imagen'}</td>
                      <td>${p.nombre || 'Sin nombre'}</td>
                      <td>${p.descripcion || 'Sin descripción'}</td>
                      <td class="stock">${p.stock ?? 0}</td>
                      <td class="price">$${p.precio ?? 0}</td>
                    </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // --- Detectar entorno ---
    const isLocal = process.env.NODE_ENV === 'development';
    console.log(`🌍 Entorno: ${isLocal ? 'Local' : 'Vercel'}`);

    // --- Configuración de Puppeteer ---
    const launchOptions = isLocal
      ? {
          headless: true,
          args: [],
          executablePath:
            process.platform === 'win32'
              ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
              : '/usr/bin/google-chrome',
        }
      : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };

    browser = await puppeteer.launch(launchOptions);
    console.log('🚀 Navegador lanzado');

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    console.log('✅ PDF generado correctamente');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte_inventario.pdf"',
      },
    });
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return NextResponse.json({ message: 'Error generando PDF', error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    await client.close().catch(() => {});
    console.log('🧹 Recursos liberados');
  }
}