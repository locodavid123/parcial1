import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import { create as createClient } from '@/models/Client';
import getDatabase from '@/app/config/couchdb.js';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rol = searchParams.get('rol');

        const query = rol ? { rol } : {};

        const users = await User.findAll(query);
        // Ocultar la contraseña de todos los usuarios en la respuesta
        const safeUsers = users.map(user => {
            const { contraseña, _rev, ...safeUser } = user;
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
    const { nombre, correo, contraseña, rol, telefono, faceDescriptor } = payload;

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

    try {
        // 1. Verificar si el correo ya existe
            const existingUser = await User.findByEmail(correo);
            if (existingUser) {
                return NextResponse.json({ 
                    message: "El correo electrónico ya está en uso." 
                }, { status: 409 });
            }        // En producción, hashea la contraseña antes de guardarla
        const hashed = await bcrypt.hash(String(contraseña), 10);

        // 2. Guardar el teléfono como string
        const userDoc = { 
            nombre, 
            correo, 
            contraseña: hashed, 
            rol, 
            telefono,
            ...(faceDescriptor && { faceDescriptor }) // Añadir solo si existe
        };
        
        // Crear el usuario
        const createdUser = await User.create(userDoc);

        // Si el rol es 'Cliente' o 'Administrador', crear también en la colección 'clientes'
        if (rol === 'Cliente' || rol === 'Administrador') {
            await createClient({
                nombre: createdUser.nombre,
                correo: createdUser.correo,
                telefono: telefono,
                usuario_id: createdUser._id // Usar el ID de CouchDB
            });
        }

        // Ocultar la contraseña en la respuesta
        const { contraseña: _, _rev, ...safeUser } = createdUser;

        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        console.error(error);
        // Devolver el status y mensaje del error si está definido
        const status = error.statusCode || 500;
        const message = error.message || 'Error al crear el usuario.';
        return NextResponse.json({ message }, { status });
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

        const updateData = {};
        if (rol) updateData.rol = rol;
        if (nombre) updateData.nombre = nombre;
        if (correo) updateData.correo = correo;
        if (telefono) updateData.telefono = telefono;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No se proporcionaron datos para actualizar." }, { status: 400 });
        }

        const db = await getDatabase();
        
        // Actualizar usuario
        const updatedUser = await User.updateById(_id, updateData);
        if (!updatedUser) {
            return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
        }

        // Si el rol es Cliente o Administrador, o si se actualizaron datos relevantes, actualizar en clientes
        if (updateData.rol === 'Cliente' || updateData.rol === 'Administrador' || nombre || correo || telefono) {
            try {
                // Buscar cliente existente
                const response = await db.clients.list({ include_docs: true });
                const existingClient = response.rows
                    .map(row => row.doc)
                    .find(doc => doc.usuario_id === _id);

                const clientData = {
                    nombre: nombre || updatedUser.nombre,
                    correo: correo || updatedUser.correo,
                    telefono: telefono || updatedUser.telefono,
                    usuario_id: _id
                };

                if (existingClient) {
                    // Actualizar cliente existente
                    await db.clients.insert({
                        ...existingClient,
                        ...clientData,
                        _id: existingClient._id,
                        _rev: existingClient._rev
                    });
                } else {
                    // Crear nuevo cliente
                    await db.clients.insert(clientData);
                }
            } catch (error) {
                console.error('Error al actualizar cliente:', error);
                // No fallamos si no se puede actualizar el cliente
            }
        }

        // Ocultar la contraseña y _rev en la respuesta
        const { contraseña, _rev, ...safeUser } = updatedUser;
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
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "Falta el ID del usuario." }, { status: 400 });
        }

        const db = await getDatabase();
        
        // Primero borramos el usuario
        await User.deleteById(id);

        // Luego buscamos y borramos el cliente asociado
        try {
            const response = await db.clients.list({ include_docs: true });
            const client = response.rows
                .map(row => row.doc)
                .find(doc => doc.usuario_id === id);
            
            if (client) {
                await db.clients.destroy(client._id, client._rev);
            }
        } catch (error) {
            console.error('Error al eliminar cliente asociado:', error);
            // No fallamos si no se puede eliminar el cliente
        }

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } catch (error) {
        console.error(error);
        const status = error.statusCode || 500;
        const message = error.message || "Error al eliminar el usuario.";
        return NextResponse.json({ message }, { status });
    }
}