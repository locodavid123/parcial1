'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

// Hook para manejar los pedidos
function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('Error al cargar los pedidos');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, fetchOrders };
}

export default function OrderManagementPage() {
    const router = useRouter();

    // Este useEffect ahora también escuchará cambios en el localStorage
    useEffect(() => {
        const checkAuth = () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                const parsedUser = JSON.parse(loggedInUser);
                if (parsedUser.rol !== 'SUPERUSER') {
                    // Si no es un SUPERUSER, lo redirige a la página principal
                    router.push('/');
                }
            } else {
                // Si no ha iniciado sesión, lo redirige al login
                router.push('/login');
            }
        };

        checkAuth(); // Comprobar al montar

        // Escuchar cambios en el storage para reaccionar al logout/login en otras pestañas
        window.addEventListener('storage', checkAuth);

        return () => window.removeEventListener('storage', checkAuth);
    }, [router]);

    const { orders, loading, error, fetchOrders } = useOrders();

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (!res.ok) throw new Error('Error al actualizar el estado');
            alert('Estado del pedido actualizado.');
            fetchOrders();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el pedido #${orderId}? Esta acción es irreversible.`)) {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar el pedido');
                alert('Pedido eliminado exitosamente.');
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completado': return 'bg-green-200 text-green-800';
            case 'Enviado': return 'bg-blue-200 text-blue-800';
            case 'Cancelado': return 'bg-red-200 text-red-800';
            default: return 'bg-yellow-200 text-yellow-800'; // Pendiente
        }
    };

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Pedidos</h1>
                    <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p>Cargando pedidos...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-black py-3 px-6 text-left">ID Pedido</th>
                                        <th className="text-black py-3 px-6 text-left">Cliente</th>
                                        <th className="text-black py-3 px-6 text-left">Fecha</th>
                                        <th className="text-black py-3 px-6 text-right">Total</th>
                                        <th className="text-black py-3 px-6 text-center">Estado</th>
                                        <th className="text-black py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="text-black py-3 px-6 font-mono">#{order.id}</td>
                                            <td className="text-black py-3 px-6">{order.cliente_nombre}</td>
                                            <td className="text-black py-3 px-6">{new Date(order.fecha).toLocaleString()}</td>
                                            <td className="text-black py-3 px-6 text-right">${parseFloat(order.total).toFixed(2)}</td>
                                            <td className="text-black py-3 px-6 text-center">
                                                <span className={`text-black  py-1 px-3 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <select
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    value={order.status}
                                                    className="text-black bg-gray-200 border rounded p-1 text-xs mr-2"
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Enviado">Enviado</option>
                                                    <option value="Completado">Completado</option>
                                                    <option value="Cancelado">Cancelado</option>
                                                </select>
                                                <button onClick={() => handleDeleteOrder(order.id)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}