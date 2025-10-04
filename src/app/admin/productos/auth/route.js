import { NextResponse } from 'next/server';
import * as Product from '@/models/Product';

// GET: Obtener todos los productos
export async function GET() {
    try {
        const results = await Product.findAll();
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return NextResponse.json({ message: "Error al obtener los productos.", error: error.message }, { status: 500 });
    }
}

// POST: Crear un nuevo producto (solo para SUPERUSER)
export async function POST(request) {
    try {
        const { nombre, descripcion, precio, stock } = await request.json();
        const newProduct = await Product.create({ nombre, descripcion, precio, stock });
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Error al crear producto:", error);
        return NextResponse.json({ message: "Error al crear el producto.", error: error.message }, { status: 500 });
    }
}

// PUT: Actualizar un producto existente (para admin y SUPERUSER)
export async function PUT(request) {
    try {
        const { id, nombre, descripcion, precio, stock } = await request.json();
        const updatedProduct = await Product.updateById(id, { nombre, descripcion, precio, stock });

        if (!updatedProduct) {
            return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        return NextResponse.json({ message: "Error al actualizar el producto.", error: error.message }, { status: 500 });
    }
}

// DELETE: Eliminar un producto (solo para SUPERUSER)
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: "Falta el ID del producto." }, { status: 400 });

        const deleted = await Product.deleteById(id);
        if (!deleted) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        return NextResponse.json({ message: "Error al eliminar el producto.", error: error.message }, { status: 500 });
    }
}