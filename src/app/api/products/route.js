import pool from "@/app/config/db";
import { NextResponse } from "next/server";

// GET all products
export async function GET() {
    try {
        const results = await pool.query("SELECT * FROM productos ORDER BY id ASC");
        // Se añade { revalidate: 0 } para deshabilitar el caché de esta ruta
        // y asegurar que siempre se obtengan los datos más recientes.
        return NextResponse.json(results.rows, { next: { revalidate: 0 } });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST a new product
export async function POST(request) {
    const { nombre, descripcion, precio, stock, imageUrl } = await request.json();
    try {
        const newProduct = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, stock, imageUrl) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nombre, descripcion, precio, stock, imageUrl]
        );
        return NextResponse.json(newProduct.rows[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PUT (update) a product
export async function PUT(request) {
    const { id, nombre, descripcion, precio, stock, imageUrl } = await request.json();
    try {
        const updatedProduct = await pool.query(
            "UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, imageUrl = $5 WHERE id = $6 RETURNING *",
            [nombre, descripcion, precio, stock, imageUrl, id]
        );
        if (updatedProduct.rowCount === 0) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json(updatedProduct.rows[0]);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE a product
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        const result = await pool.query("DELETE FROM productos WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
