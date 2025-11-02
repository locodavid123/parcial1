import { NextResponse } from 'next/server';
import * as User from '@/models/User';

export async function POST(request) {
    try {
        const { faceDescriptor } = await request.json();

        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            return NextResponse.json(
                { message: 'Datos biométricos inválidos.' },
                { status: 400 }
            );
        }

        // Buscar usuario por descriptor facial
        const user = await User.findByFaceDescriptor(faceDescriptor);

        if (!user) {
            return NextResponse.json(
                { message: 'No se encontró ningún usuario con ese rostro.' },
                { status: 401 }
            );
        }

        // Limpiar datos sensibles antes de enviar y manejar _id de CouchDB
        const { contraseña, password, faceDescriptors, _rev, ...safeUser } = user;
        safeUser.id = safeUser._id;
        delete safeUser._id;

        return NextResponse.json({
            message: 'Autenticación facial exitosa.',
            user: safeUser
        });

    } catch (error) {
        console.error('Error en autenticación facial:', error);
        return NextResponse.json(
            { message: 'Error en la autenticación facial.' },
            { status: 500 }
        );
    }
}