'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import Header from '@/components/Headers/page';
import Link from 'next/link';
import Footer from '@/components/Footer/page';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const { users = [], loading = false, error } = useUsers(); // fallback para evitar errores

    // Check if user is already logged in on component mount
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('loggedInUser')) {
            router.push('/superUser'); // Or wherever the logged-in user should go
        }
    }, [router]);
    const redirectByRole = (rol) => {
        const routes = {
            SUPERUSER: '/superUser',
            administador: '/products',
            cliente: '/clientes',
        };
        router.push(routes[rol] || '/');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoginError('');

        if (!email.includes('@')) {
            setLoginError('El correo electrónico no es válido.');
            return;
        }

        const user = users.find(u => u.correo === email);

        if (user) {
            // In a real application, the password should be hashed and compared securely on the server.
            // This is for demonstration purposes only.
            if (user.contraseña === password) {
                // Store user info in localStorage to persist login state
                localStorage.setItem('loggedInUser', JSON.stringify({ id: user.id, nombre: user.nombre, rol: user.rol }));

                alert(`¡Bienvenido, ${user.nombre}! Redirigiendo...`);
                redirectByRole(user.rol);
            } else {
                setLoginError('La contraseña es incorrecta.');
            }
        } else {
            setLoginError('El usuario no se encuentra registrado.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
            <div className="w-full">
                <Header />
            </div>
            <div className="flex-1 flex items-center justify-center my-10">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-100 rounded-full p-4 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75A2.25 2.25 0 0117.25 23h-10.5A2.25 2.25 0 014.5 21v-.75z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-800">Iniciar Sesión</h1>
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
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border border-yellow-200 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            required
                        />
                        {loginError && (
                            <p className="text-red-500 text-xs italic mt-2 text-center">{loginError}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 via-yellow-400 to-pink-400 hover:from-blue-600 hover:via-yellow-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 w-full flex justify-center items-center disabled:bg-gray-400 transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Cargando...
                            </span>
                        ) : 'Ingresar'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/register" className="font-medium text-blue-500 hover:text-blue-600">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
                </div>
            </div>
            <div className="w-full mt-8">
                <Footer />
            </div>
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.7s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}