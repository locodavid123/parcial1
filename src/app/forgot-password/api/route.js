import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'El correo electrónico es obligatorio.' }, { status: 400 });
        }

        const user = await User.findByEmail(email);

        // Por seguridad, no revelamos si el usuario existe o no.
        // Siempre devolvemos un mensaje genérico.
        if (!user) {
            console.log(`Intento de recuperación para correo no existente: ${email}`);
            return NextResponse.json({ message: 'Si tu correo está registrado, recibirás un enlace de recuperación.' });
        }

        // 1. Generar un token de reseteo seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 2. Establecer una fecha de expiración para el token (ej. 10 minutos)
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

        // 3. Guardar el token y la fecha de expiración en el documento del usuario
        await User.updateById(user._id, {
            passwordResetToken,
            passwordResetExpires,
        });

        // 4. Crear la URL de reseteo que se enviará en el correo
        // Asegúrate de tener NEXT_PUBLIC_BASE_URL en tu .env.local (ej: http://localhost:3000)
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

        // 5. Configurar y enviar el correo electrónico
        // NOTA: Debes configurar estas variables de entorno en tu archivo .env.local
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true para puerto 465, false para otros
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"La Casa de la Chunchulla" <${process.env.EMAIL_FROM}>`,
            to: user.correo,
            subject: 'Recuperación de Contraseña',
            html: `<p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para continuar:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>Si no solicitaste esto, por favor ignora este correo.</p>`,
        });

        return NextResponse.json({ message: 'Si tu correo está registrado, recibirás un enlace de recuperación.' });

    } catch (error) {
        console.error('Error en /api/auth/forgot-password:', error);
        // Limpiar el token si algo falla para evitar problemas de seguridad
        // (Esta parte es opcional pero recomendada)
        // await User.updateById(user._id, {
        //     passwordResetToken: undefined,
        //     passwordResetExpires: undefined,
        // });
        return NextResponse.json({ message: 'Error al procesar la solicitud.' }, { status: 500 });
    }
}