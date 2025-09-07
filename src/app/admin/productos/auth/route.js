import pool from "@/app/config/db";
import { NextResponse } from "next/server";

// GET: Obtener todos los productos
export async function GET() {
    try {
        const results = await pool.query("SELECT * FROM productos ORDER BY id ASC");
        return NextResponse.json(results.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return NextResponse.json({ message: "Error al obtener los productos.", error: error.message }, { status: 500 });
    }
}

// POST: Crear un nuevo producto (solo para SUPERUSER)
export async function POST(request) {
    try {
        const { nombre, descripcion, precio, stock } = await request.json();
        const newProduct = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *",
            [nombre, descripcion, precio, stock]
        );
        return NextResponse.json(newProduct.rows[0], { status: 201 });
    } catch (error) {
        console.error("Error al crear producto:", error);
        return NextResponse.json({ message: "Error al crear el producto.", error: error.message }, { status: 500 });
    }
}

// PUT: Actualizar un producto existente (para admin y SUPERUSER)
export async function PUT(request) {
    try {
        const { id, nombre, descripcion, precio, stock } = await request.json();
        const updatedProduct = await pool.query(
            "UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *",
            [nombre, descripcion, precio, stock, id]
        );

        if (updatedProduct.rowCount === 0) {
            return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedProduct.rows[0]);
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

        const result = await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        return NextResponse.json({ message: "Error al eliminar el producto.", error: error.message }, { status: 500 });
    }
}