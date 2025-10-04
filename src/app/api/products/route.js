import { NextResponse } from "next/server";
import * as Product from '@/models/Product';

// GET all products
export async function GET() {
    try {
        const results = await Product.findAll();
        // Deshabilitar cache para siempre devolver datos frescos
        return NextResponse.json(results, { next: { revalidate: 0 } });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST a new product
export async function POST(request) {
    const { nombre, descripcion, precio, stock, imageUrl } = await request.json();
    try {
        const created = await Product.create({ nombre, descripcion, precio, stock, imageUrl });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PUT (update) a product
export async function PUT(request) {
    const { id, nombre, descripcion, precio, stock, imageUrl } = await request.json();
    try {
        const updated = await Product.updateById(id, { nombre, descripcion, precio, stock, imageUrl });
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
