import { NextResponse } from 'next/server';
import { findAll, findByEmail, create as createUser, updateById as updateUserById, deleteById as deleteUserById } from '@/models/User';
import { create as createClient } from '@/models/Client';
import { getClient, getDb } from '@/app/config/mongo';
import { Int32 } from 'mongodb'; // 1. Importar Int32
import bcrypt from 'bcryptjs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rol = searchParams.get('rol');

        const query = rol ? { rol } : {};

        const users = await findAll(query);
        // Ocultar la contraseña de todos los usuarios en la respuesta
        const safeUsers = users.map(user => {
            const { contraseña, ...safeUser } = user;
            return safeUser;
        });
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return NextResponse.json({ message: "Error al obtener los usuarios." }, { status: 500 });
    }
}

export async function POST(request) {
    const payload = await request.json();
    const { nombre, correo, contraseña, rol, telefono } = payload;

    // Validación básica de los datos
    if (!nombre || !correo || !contraseña || !rol || !telefono) {
        return NextResponse.json({ message: "Todos los campos (nombre, correo, contraseña, rol, telefono) son obligatorios." }, { status: 400 });
    }

    // Validar el formato del teléfono para que coincida con el esquema de la BD
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) {
        return NextResponse.json({ message: "El teléfono debe contener exactamente 10 dígitos numéricos." }, { status: 400 });
    }

    // Validar la longitud de la contraseña original para cumplir con el esquema
    if (contraseña.length < 6) {
        return NextResponse.json({ message: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const client = await getClient();
    const session = client.startSession();

    try {
        let createdUser;
        await session.withTransaction(async () => {
            // 1. Verificar si el correo ya existe
            const existingUser = await findByEmail(correo, { session });
            if (existingUser) {
                // Lanzar un error específico que será capturado por el bloque catch
                const error = new Error("El correo electrónico ya está en uso.");
                error.status = 409; // HTTP 409 Conflict
                throw error;
            }

            // En producción, hashea la contraseña antes de guardarla
            const hashed = await bcrypt.hash(String(contraseña), 10);

            // 2. Guardar el teléfono como string
            const userDoc = { nombre, correo, contraseña: hashed, rol, telefono };
            createdUser = await createUser(userDoc, { session });

            // Si el rol es 'Cliente' o 'Administrador', crear también en la colección 'clientes'
            if (rol === 'Cliente' || rol === 'Administrador') {
                await createClient({
                    nombre: createdUser.nombre,
                    correo: createdUser.correo,
                    telefono: telefono,
                    usuario_id: createdUser._id // Vincular con el usuario recién creado
                }, { session });
            }

        });

        // Ocultar la contraseña en la respuesta
        const { contraseña: _, ...safeUser } = createdUser;

        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        console.error(error);
        // Devolver el status y mensaje del error si está definido (ej. 409)
        const status = error.status || 500;
        const message = error.message || 'Error al crear el usuario.';
        return NextResponse.json({ message }, { status });
    } finally {
        await session.endSession();
    }
}

export async function PUT(request) {
    const client = await getClient();
    const session = client.startSession();
    try {
        // Usar _id para ser consistente con la base de datos
        const payload = await request.json();
        const { _id, rol, nombre, correo, telefono } = payload;

        if (!_id) {
            return NextResponse.json(
                { message: "Se requiere el ID del usuario." },
                { status: 400 }
            );
        }

        // Iniciar una transacción para asegurar la atomicidad de la operación
        let finalUpdatedUser;
        const updateData = {};
        if (rol) updateData.rol = rol;
        if (nombre) updateData.nombre = nombre;
        if (correo) updateData.correo = correo;
        if (telefono) updateData.telefono = telefono;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No se proporcionaron datos para actualizar." }, { status: 400 });
        }

        await session.withTransaction(async () => {
            const updatedUser = await updateUserById(_id, updateData, { session });
            if (!updatedUser) {
                const error = new Error("Usuario no encontrado.");
                error.status = 404;
                throw error;
            }

            // Si el rol es Cliente o Administrador, asegurarse de que exista en la colección 'clientes'
            if (updateData.rol === 'Cliente' || updateData.rol === 'Administrador' || nombre || correo || telefono) {
                const db = await getDb();
                const clientCollection = db.collection('clientes');
                // Usar upsert: si no existe un cliente con ese usuario_id, lo crea.
                await clientCollection.updateOne(
                    { usuario_id: updatedUser._id },
                    { $set: { 
                        nombre: nombre || updatedUser.nombre, 
                        correo: correo || updatedUser.correo, 
                        telefono: telefono || updatedUser.telefono
                    } },
                    { upsert: true, session }
                );
            }
            finalUpdatedUser = updatedUser;
        });

        // Ocultar la contraseña en la respuesta
        const { contraseña, ...safeUser } = finalUpdatedUser;
        return NextResponse.json(safeUser);
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        const message = error.message || "Error al actualizar el usuario.";
        return NextResponse.json({ message }, { status });
    } finally {
        await session.endSession();
    }
}

export async function DELETE(request) {
    const client = await getClient();
    const session = client.startSession();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "Falta el ID del usuario." }, { status: 400 });
        }

        let deletedUser;
        await session.withTransaction(async () => {
            // Borramos el usuario de la colección 'usuarios'
            deletedUser = await deleteUserById(id, { session });
            if (deletedUser) {
                // Borramos el registro correspondiente de la colección 'clientes'
                const db = await getDb();
                await db.collection('clientes').deleteOne({ usuario_id: deletedUser._id }, { session });
            }
        });

        if (!deletedUser) {
            return NextResponse.json({ message: "Usuario no encontrado para eliminar." }, { status: 404 });
        }

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        const message = error.message || "Error al eliminar el usuario.";
        return NextResponse.json({ message }, { status });
    } finally {
        await session.endSession();
    }
}