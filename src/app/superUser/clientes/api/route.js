import pool from "@/app/config/db";
import { NextResponse } from "next/server";

// GET: Obtener todos los clientes
export async function GET() {
    try {
        const results = await pool.query("SELECT * FROM clientes ORDER BY id ASC");
        return NextResponse.json(results.rows);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return NextResponse.json({ message: "Error al obtener los clientes.", error: error.message }, { status: 500 });
    }
}

// POST: Crear un nuevo cliente
export async function POST(request) {
    try {
        const { nombre, correo, telefono } = await request.json();

        if (!nombre || !correo || !telefono) {
            return NextResponse.json(
                { message: "Nombre, correo y teléfono son obligatorios." },
                { status: 400 }
            );
        }

        const newClient = await pool.query(
            "INSERT INTO clientes (nombre, correo, telefono) VALUES ($1, $2, $3) RETURNING *",
            [nombre, correo, telefono]
        );

        return NextResponse.json(newClient.rows[0], { status: 201 });

    } catch (error) {
        console.error("Error al crear cliente:", error);
        return NextResponse.json({ message: "Error al crear el cliente.", error: error.message }, { status: 500 });
    }
}

// PUT: Actualizar un cliente existente
export async function PUT(request) {
    try {
        const { id, nombre, correo, telefono } = await request.json();

        if (!id || !nombre || !correo || !telefono) {
            return NextResponse.json(
                { message: "Se requiere ID, nombre, correo y teléfono." },
                { status: 400 }
            );
        }

        const updatedClient = await pool.query(
            "UPDATE clientes SET nombre = $1, correo = $2, telefono = $3 WHERE id = $4 RETURNING *",
            [nombre, correo, telefono, id]
        );

        if (updatedClient.rowCount === 0) {
            return NextResponse.json({ message: "Cliente no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedClient.rows[0]);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return NextResponse.json({ message: "Error al actualizar el cliente.", error: error.message }, { status: 500 });
    }
}

// DELETE: Eliminar un cliente
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "Falta el ID del cliente." }, { status: 400 });

        await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
        return NextResponse.json({ message: "Cliente eliminado" }, { status: 200 });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        return NextResponse.json({ message: "Error al eliminar el cliente.", error: error.message }, { status: 500 });
    }
}