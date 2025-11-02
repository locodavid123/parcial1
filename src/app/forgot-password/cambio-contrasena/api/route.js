import { NextResponse } from 'next/server';
import { findByToken, updateUser } from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token y contraseña son requeridos.' }, { status: 400 });
    }

    // 1. Hashear el token que viene del cliente para compararlo con el de la BD
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Buscar al usuario por el token hasheado y verificar que no haya expirado
    const user = await findByToken({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: 'El token es inválido o ha expirado.' }, { status: 400 });
    }

    // 3. Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Actualizar la contraseña del usuario y limpiar los campos de reseteo
    await updateUser(user._id, {
      contraseña: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return NextResponse.json({ message: '¡Tu contraseña ha sido restablecida con éxito!' });

  } catch (error) {
    console.error('Error en /forgot-password/cambio-contrasena/api:', error);

    // Evitar exponer detalles del error en producción
    if (error instanceof Error && error.name === 'BSONError') {
        return NextResponse.json({ message: 'El token proporcionado no es válido.' }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Ocurrió un error interno al restablecer la contraseña.' },
      { status: 500 }
    );
  }
}