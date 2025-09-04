'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';

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
            cliente: '/bodyuser',
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                        {loginError && (
                            <p className="text-red-500 text-xs italic">{loginError}</p>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex justify-center items-center disabled:bg-gray-400"
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
                    </div>
                </form>
            </div>
        </div>
    );
}