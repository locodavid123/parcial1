'use client';

import { useState, useEffect } from 'react';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

export default function SuperUserOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clientQuery, setClientQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) {
                throw new Error('No se pudieron cargar los pedidos.');
            }
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClientReport = (e) => {
        e.preventDefault();
        if (clientQuery.trim()) {
            // Redirige para iniciar la descarga del archivo
            window.location.href = `/api/reports/client-purchases?query=${encodeURIComponent(clientQuery)}`;
        } else {
            alert('Por favor, ingrese un nombre o ID de cliente.');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders?id=${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'No se pudo actualizar el estado del pedido.');
            }

            // Actualizar la lista de pedidos para reflejar el cambio
            setOrders(prevOrders =>
                prevOrders.map(o => o._id === orderId ? { ...o, estatus: newStatus } : o)
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Headers />
            <main className="container mx-auto px-4 py-8 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-black mb-6">Gestión de Pedidos y Reportes</h1>

                    {/* Sección de Reportes */}
                    <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4 text-black">Generación de Reportes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            {/* Reportes Generales */}
                            <div className="flex flex-col sm:flex-row gap-4 text-base">
                                <a href="/api/report/reporte-ventas" download className="bg-blue-500 text-white text-center font-medium py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                                    Reporte de Ventas
                                </a>
                                <a href="/api/report/reporte-stock" download className="bg-green-500 text-white text-center font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                                    Reporte de Stock
                                </a>
                            </div>

                            {/* Reporte por Cliente */}
                            <form onSubmit={handleClientReport} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={clientQuery}
                                    onChange={(e) => setClientQuery(e.target.value)}
                                    placeholder="Buscar por nombre o ID de cliente"
                                    className="p-2 border rounded-md w-full text-base text-black"
                                />
                                <button type="submit" className="bg-purple-500 text-white font-medium py-2 px-4 rounded-md hover:bg-purple-600 transition-colors text-base">
                                    Reporte Cliente
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lista de Pedidos */}
                    <h2 className="text-xl font-semibold mb-4 text-black">Historial de Pedidos</h2>
                    {loading && <p>Cargando pedidos...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <div className="space-y-4">
                            {orders.length > 0 ? orders.map(order => (
                                <div key={order._id} className="bg-gray-50 p-4 rounded-lg border text-black">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div>
                                            <p className="font-semibold text-base">Pedido #{order._id.slice(-6)}</p>
                                            <p className="text-base">Cliente: {order.cliente?.nombre || 'N/A'}</p>
                                        </div>
                                        <p className="text-base">Fecha: {new Date(order.fecha).toLocaleDateString()}</p>
                                        <p className="font-semibold text-lg">Total: ${parseFloat(order.total).toFixed(2)}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-base font-medium px-3 py-1 rounded-full ${
                                                order.estatus === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                                                order.estatus === 'completado' ? 'bg-green-200 text-green-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>
                                                {order.estatus}
                                            </span>
                                            <select
                                                value={order.estatus}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="p-1 border rounded-md text-base text-black"
                                                disabled={order.estatus === 'cancelado'}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="completado">Completado</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t pt-3">
                                        <h4 className="font-semibold text-base">Detalles:</h4>
                                        <ul className="list-disc list-inside text-base">
                                            {order.detalles?.map(item => (
                                                <li key={item.producto_id}>
                                                    {item.cantidad} x (ID: {item.producto_id.slice(-6)}) @ ${parseFloat(item.precio_unitario).toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500">No hay pedidos para mostrar.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}