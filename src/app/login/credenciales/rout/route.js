import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { correo, contraseña } = await request.json();

        if (!correo || !contraseña) {
            return NextResponse.json({ message: 'Correo y contraseña son obligatorios.' }, { status: 400 });
        }

        // Buscar al usuario por correo electrónico (insensible a mayúsculas/minúsculas)
        const user = await User.findByEmail(correo);

        if (!user) {
            return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
        }

        // Comparar la contraseña enviada con la hasheada en la base de datos
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);

        if (!isMatch) {
            return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
        }

        // No devolver la contraseña en la respuesta
        const { contraseña: _, ...userWithoutPassword } = user;

        return NextResponse.json({ message: 'Inicio de sesión exitoso', user: userWithoutPassword });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}