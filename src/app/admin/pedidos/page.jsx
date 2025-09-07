
'use client';

import { useState, useEffect } from 'react';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error("Error al cargar los pedidos");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, error, fetchOrders };
}

export default function OrderManagementPage() {
    const { orders, loading, error, fetchOrders } = useOrders();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [apiError, setApiError] = useState('');

    const handleOpenModal = (order) => {
        setApiError('');
        setCurrentOrder({ ...order });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleStatusChange = (e) => {
        setCurrentOrder(prev => ({ ...prev, status: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentOrder.id, status: currentOrder.status }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el pedido');
            }

            alert('¡Estado del pedido actualizado!');
            handleCloseModal();
            fetchOrders();
        } catch (err) {
            setApiError(err.message);
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el pedido #${orderId}?`)) {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar el pedido');
                }
                alert('¡Pedido eliminado exitosamente!');
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Pedidos</h1>
                    <Link href="/admin" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p className="text-center">Cargando pedidos...</p>}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-black py-3 px-6 text-left">ID Pedido</th>
                                        <th className="text-black py-3 px-6 text-left">Cliente</th>
                                        <th className="text-black py-3 px-6 text-left">Fecha</th>
                                        <th className="text-black py-3 px-6 text-left">Total</th>
                                        <th className="text-black py-3 px-6 text-left">Estado</th>
                                        <th className="text-black py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-6 font-mono">#{order.id}</td>
                                            <td className="py-3 px-6">{order.cliente_nombre}</td>
                                            <td className="py-3 px-6">{new Date(order.fecha).toLocaleDateString()}</td>
                                            <td className="py-3 px-6">${parseFloat(order.total).toFixed(2)}</td>
                                            <td className="py-3 px-6">
                                                <span className={`py-1 px-3 rounded-full text-xs ${order.status === 'Completado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <button onClick={() => handleOpenModal(order)} className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600 mr-2">Editar</button>
                                                <button onClick={() => handleDelete(order.id)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">Eliminar</button>
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

            {isModalOpen && currentOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Pedido #{currentOrder.id}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado del Pedido</label>
                                <select id="status" value={currentOrder.status} onChange={handleStatusChange} className="shadow border rounded w-full py-2 px-3 text-gray-700">
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Procesando">Procesando</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Completado">Completado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>
                            {apiError && <p className="text-red-500 text-xs italic mb-4">{apiError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Actualizar Estado</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}