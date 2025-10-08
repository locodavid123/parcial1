'use client';

import { useState } from 'react';
import Link from 'next/link';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validación básica de correo
        if (!email.includes('@')) {
            setError('Por favor, introduce un correo electrónico válido.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/forgot-password/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Ocurrió un error al enviar el correo.');
            }

            setMessage(data.message);
            setEmail(''); // Limpiar el campo de entrada
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
            <div className="w-full">
                <Headers />
            </div>
            <div className="flex-1 flex items-center justify-center my-10">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-yellow-100 rounded-full p-4 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-yellow-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-center text-gray-800">Recuperar Contraseña</h1>
                        <p className="text-gray-600 text-center mt-2 text-sm">
                            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow appearance-none border border-blue-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
                        {message && <p className="text-green-600 text-sm text-center bg-green-100 p-3 rounded-lg">{message}</p>}

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 w-full flex justify-center items-center disabled:opacity-50 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600">
                            &larr; Volver a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
            <div className="w-full mt-8">
                <Footer />
            </div>
        </div>
    );
}