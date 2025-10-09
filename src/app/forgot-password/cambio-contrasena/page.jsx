'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

// Componente interno para poder usar useSearchParams dentro de Suspense
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no válido o ausente. Por favor, solicita un nuevo enlace de recuperación.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/forgot-password/cambio-contrasena/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Ocurrió un error al restablecer la contraseña.');
      }

      setMessage(data.message);
      setTimeout(() => router.push('/login'), 3000); // Redirigir al login después de 3 segundos
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Restablecer Contraseña</h1>
      <p className="text-gray-600 text-center mb-6 text-sm">
        Introduce tu nueva contraseña.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña</label>
          <input
            type="password" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña</label>
          <input
            type="password" id="confirmPassword" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center bg-green-100 p-3 rounded-lg">{message}</p>}

        <button type="submit" disabled={loading || !token} className="bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-full w-full disabled:opacity-50 transition-all">
          {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
        </button>
      </form>
      {message && (
        <div className="text-center mt-4">
          <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600">
            Ir a Iniciar Sesión
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
            <Headers />
            <main className="flex-1 flex items-center justify-center my-10 px-4">
                <Suspense fallback={<div className="text-center">Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}