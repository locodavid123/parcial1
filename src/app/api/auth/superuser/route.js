import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { nombre, correo, contraseña, telefono } = await request.json();

        // Validaciones básicas
        if (!nombre || !correo || !contraseña || !telefono) {
            return NextResponse.json({ 
                message: "Todos los campos son requeridos." 
            }, { status: 400 });
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return NextResponse.json({ 
                message: "Formato de correo electrónico inválido." 
            }, { status: 400 });
        }

        // Validar longitud de la contraseña
        if (contraseña.length < 6) {
            return NextResponse.json({ 
                message: "La contraseña debe tener al menos 6 caracteres." 
            }, { status: 400 });
        }

        // Validar formato del teléfono
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(telefono)) {
            return NextResponse.json({ 
                message: "El teléfono debe contener exactamente 10 dígitos." 
            }, { status: 400 });
        }

        // Verificar si ya existe un usuario con ese correo
        const existingUser = await User.findByEmail(correo);
        if (existingUser) {
            return NextResponse.json({ 
                message: "Ya existe un usuario con ese correo electrónico." 
            }, { status: 409 });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear el superusuario
        const user = await User.create({
            nombre,
            correo,
            contraseña: hashedPassword,
            telefono,
            rol: 'SuperUser'
        });

        // Eliminar datos sensibles de la respuesta
        const { contraseña: _, _rev, ...safeUser } = user;

        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        console.error('Error al crear superusuario:', error);
        return NextResponse.json({ 
            message: "Error al crear el superusuario." 
        }, { status: 500 });
    }
}