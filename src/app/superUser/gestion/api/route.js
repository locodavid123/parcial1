import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import * as Client from '@/models/Client';
import { getClient, getDb } from '@/app/config/mongo';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    const payload = await request.json();
    const { nombre, correo, contraseña, rol, telefono } = payload;

    // Validación básica de los datos
    if (!nombre || !correo || !contraseña || !rol) {
        return NextResponse.json({ message: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const client = await getClient();
    const session = client.startSession();

    try {
        let createdUser;
        await session.withTransaction(async () => {
            const db = await getDb();
            // En producción, hashea la contraseña antes de guardarla
            const hashed = await bcrypt.hash(String(contraseña), 10);
            const userDoc = { nombre, correo, contraseña: hashed, rol };
            createdUser = await User.create(userDoc, { session });

            if (rol === 'cliente') {
                await Client.create({ nombre, correo, telefono: telefono || '', usuario_id: createdUser._id }, { session });
            }
        });

        return NextResponse.json(createdUser, { status: 201 });
    } catch (error) {
        console.error(error);
        // Detección básica de duplicados
        if (error.message && error.message.includes('duplicate')) {
            return NextResponse.json({ message: 'El correo electrónico ya está registrado.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error al crear el usuario.' }, { status: 500 });
    } finally {
        await session.endSession();
    }
}

export async function PUT(request) {
    try {
        const { id, rol } = await request.json();

        if (!id || !rol) {
            return NextResponse.json(
                { message: "Se requiere el ID del usuario y el nuevo rol." },
                { status: 400 }
            );
        }

        const updatedUser = await User.updateById(id, { rol });

        if (!updatedUser) {
            return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al actualizar el usuario." }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "Falta el ID del usuario." }, { status: 400 });
        }

        await User.deleteById(id);

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al eliminar el usuario." }, { status: 500 });
    }
}