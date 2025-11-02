import { NextResponse } from "next/server";
import * as Product from '@/models/Product';

// GET all products
export async function GET() {
    try {
        const results = await Product.findAll();
        // Deshabilitar cache para siempre devolver datos frescos
        return NextResponse.json(results, { next: { revalidate: 0 } });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return NextResponse.json({ 
            message: 'Error al obtener productos', 
            details: error.statusCode ? `Error de CouchDB: ${error.message}` : error.message 
        }, { status: error.statusCode || 500 });
    }
}

// POST a new product
export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch (err) {
        return NextResponse.json({ message: 'JSON inválido en el cuerpo de la petición' }, { status: 400 });
    }

    const { nombre, descripcion, precio, stock, imageUrl } = body || {};

    // Validaciones básicas del lado del servidor para dar errores claros al cliente
    if (
        !nombre || String(nombre).trim() === '' ||
        !descripcion || String(descripcion).trim() === '' || // Añadido: descripcion es requerida
        precio === undefined || // Añadido: precio es requerido
        stock === undefined // Añadido: stock es requerido
    ) {
        // Mensaje de error más genérico para campos faltantes
        return NextResponse.json({ message: 'Faltan campos obligatorios: nombre, descripcion, precio, stock, imagenUrl' }, { status: 400 });
    }

    const precioNum = precio === undefined ? undefined : Number(precio);
    if (precio !== undefined && !Number.isFinite(precioNum)) {
        return NextResponse.json({ message: 'El campo "precio" debe ser un número válido' }, { status: 400 });
    }

    const stockNum = stock === undefined ? undefined : Number(stock);
    if (stock !== undefined && !Number.isFinite(stockNum)) {
        return NextResponse.json({ message: 'El campo "stock" debe ser un número válido' }, { status: 400 });
    }

    // Validar imagenUrl (el validador de Atlas requiere 'imagenUrl' y un patrón http/https)
    const imagen = body.imageUrl || body.imagenUrl;
    if (!imagen || String(imagen).trim() === '') {
        return NextResponse.json({ message: 'El campo "imagenUrl" es obligatorio y debe ser una URL válida (http/https)' }, { status: 400 });
    }

    // Validar mínimo 0 según el esquema
    if (precioNum !== undefined && precioNum < 0) {
        return NextResponse.json({ message: 'El campo "precio" debe ser mayor o igual a 0' }, { status: 400 });
    }
    if (stockNum !== undefined && stockNum < 0) {
        return NextResponse.json({ message: 'El campo "stock" debe ser mayor o igual a 0' }, { status: 400 });
    }

    try {
        const created = await Product.create({ nombre, descripcion, precio: precioNum, stock: stockNum, imageUrl: imagen });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        // Si la función del modelo lanzó un error con status, reusarlo
        if (error && error.status) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        console.error('Unhandled error en POST /api/products:', error);
        return NextResponse.json({ message: error.message || 'Error interno' }, { status: 500 });
    }
}

// PUT (update) a product
export async function PUT(request) {
    // Corregido: Usar _id para consistencia con MongoDB
    const { _id, nombre, descripcion, precio, stock, imageUrl } = await request.json(); // El comentario sobre MongoDB puede ser confuso, pero _id también es usado por CouchDB.

    if (!_id) {
        return NextResponse.json({ message: "El ID del producto es requerido para actualizar" }, { status: 400 });
    }

    try {
        const updated = await Product.updateById(_id, { nombre, descripcion, precio, stock, imageUrl });
        if (!updated) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE a product
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validar que el ID existe. La validación de formato ObjectId de Mongo se ha eliminado.
    if (!id) {
        return NextResponse.json({ message: "ID de producto inválido" }, { status: 400 });
    }

    try {
        const deleted = await Product.deleteById(id);
        if (!deleted) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json(deleted);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
