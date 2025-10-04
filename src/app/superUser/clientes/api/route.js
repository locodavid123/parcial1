import { NextResponse } from 'next/server';
import * as Client from '@/models/Client';

// GET: Obtener todos los clientes
export async function GET() {
    try {
        const results = await Client.findAll();
        return NextResponse.json(results);
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

        const newClient = await Client.create({ nombre, correo, telefono });

        return NextResponse.json(newClient, { status: 201 });

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

        const updatedClient = await Client.updateById(id, { nombre, correo, telefono });

        if (!updatedClient) {
            return NextResponse.json({ message: "Cliente no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedClient);
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

        await Client.deleteById(id);
        return NextResponse.json({ message: "Cliente eliminado" }, { status: 200 });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        return NextResponse.json({ message: "Error al eliminar el cliente.", error: error.message }, { status: 500 });
    }
}