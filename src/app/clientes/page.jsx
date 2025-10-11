'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

export default function ClientePanel() {
    const [user, setUser] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPedidos, setShowPedidos] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            // CORRECCIÓN: El rol se guarda como 'Cliente' (con mayúscula inicial).
            if (parsedUser.rol === 'Cliente') {
                setUser(parsedUser);
                setLoading(false);
            } else {
                // Si no es un cliente, lo redirige a la página principal
                router.push('/');
            }
        } else {
            // Si no ha iniciado sesión, lo redirige al login
            router.push('/login');
        }
    }, [router]);

    const handleVerPedidos = async () => {
        if (showPedidos) {
            setShowPedidos(false);
            return;
        }

        setError('');
        try {
            // La API de pedidos ya está preparada para filtrar por el ID del usuario
            const res = await fetch(`/api/orders?cliente_id=${user.id}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al obtener los pedidos');
            }
            const data = await res.json();
            setPedidos(data);
            setShowPedidos(true);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Cargando panel...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-red-50 to-gray-100">
            <Headers />
            <main className="flex-1 container mx-auto p-8 bg-gradient-to-br from-yellow-50 via-red-50 to-gray-100">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Panel de Cliente</h1>
                <p className="text-xl text-gray-600 mb-10">¡Hola, {user?.nombre}!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-lg mx-auto">
                    <button onClick={handleVerPedidos} className="bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                        {showPedidos ? 'Ocultar Mis Pedidos' : 'Ver Mis Pedidos'}
                    </button>
                    <Link href="/" className="bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 text-center">
                        Hacer Pedido
                    </Link>
                </div>

                {error && <p className="text-red-600 mt-6 text-center bg-red-100 p-3 rounded-lg">{error}</p>}

                {showPedidos && (
                    <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Historial de Pedidos</h2>
                        {pedidos.length > 0 ? (
                            <div className="space-y-6">
                                {pedidos.map(pedido => (
                                    <div key={pedido.id} className="border border-gray-200 p-4 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-bold text-lg text-gray-700">Pedido #{pedido.id}</p>
                                            <p className={`px-3 py-1 rounded-full text-sm font-semibold ${pedido.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{pedido.status}</p>
                                        </div>
                                        <p className="text-gray-600">Fecha: {new Date(pedido.fecha).toLocaleDateString()}</p>
                                        <p className="text-gray-800 font-semibold">Total: ${parseFloat(pedido.total).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-gray-500">No tienes pedidos registrados.</p>)}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}