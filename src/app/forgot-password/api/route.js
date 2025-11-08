import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Función para enviar el correo de restablecimiento de contraseña usando nodemailer.
async function sendPasswordResetEmail(email, token) {
    // Construye la URL de reseteo que se enviaría en el correo.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/forgot-password/cambio-contrasena?token=${token}`;

    // Configura el transportador de correo para usar Ethereal Email.
    // Ethereal es un servicio de prueba que no envía correos reales,
    // sino que los captura para que puedas previsualizarlos.
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'dana88@ethereal.email',
            pass: 'KZXXWkDk8eUg8Y6uxg'
        },
    });

    // Define el contenido del correo.
    const mailOptions = {
        from: '"Soporte de Cuentas" <soporte@tuapp.com>',
        to: email, // El correo del usuario que solicitó el reseteo
        subject: 'Recuperación de Contraseña',
        html: `<p>Has solicitado restablecer tu contraseña.</p>
               <p>Por favor, haz clic en el siguiente enlace para continuar:</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>El enlace expirará en 10 minutos.</p>
               <p>Si no solicitaste esto, por favor ignora este correo.</p>`,
    };

    // Envía el correo.
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de prueba enviado: %s', info.messageId);
    // La siguiente URL te permite ver el correo enviado en el navegador.
    console.log('Puedes ver el correo en: %s', nodemailer.getTestMessageUrl(info));
}

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'El correo electrónico es obligatorio.' }, { status: 400 });
        }

        const user = await User.findByEmail(email);

        if (!user) {
            // Por seguridad, no revelamos si el usuario existe o no.
            // Siempre devolvemos un mensaje genérico para evitar la enumeración de usuarios.
            console.log(`Intento de recuperación para correo no existente: ${email}`);
            return NextResponse.json({ message: 'Si tu correo está registrado, recibirás un enlace de recuperación.' });
        }

        // Generar un token de reseteo seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Establecer una fecha de expiración para el token (ej. 10 minutos)
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Guardar el token hasheado y la fecha de expiración en el documento del usuario
        await User.updateById(user._id, {
            passwordResetToken,
            passwordResetExpires,
        });

        // "Enviar" el correo (imprimir el enlace en la consola)
        await sendPasswordResetEmail(user.correo, resetToken);

        return NextResponse.json({ message: 'Si tu correo está registrado, recibirás un enlace de recuperación.' });

    } catch (error) {
        console.error('Error en /forgot-password/api:', error);
        return NextResponse.json({ message: 'Error al procesar la solicitud.' }, { status: 500 });
    }
}