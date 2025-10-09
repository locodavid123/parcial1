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
    const { orders, loading, error, fetchOrders } = useOrders();

    // Función para descargar el PDF de pedidos
    const handleDownloadPDF = async () => {
        try {
            // Apuntar al endpoint correcto para el reporte de pedidos
            const res = await fetch('/api/orders/print');
            if (!res.ok) throw new Error('No se pudo generar el PDF');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_pedidos.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders?id=${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Error al actualizar el estado');
            fetchOrders(); // Recargar pedidos
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar el pedido');
                fetchOrders(); // Recargar pedidos
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
            default: return 'bg-yellow-200 text-yellow-800';
        }
    };

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Pedidos</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                        >
                            Descargar PDF
                        </button>
                        <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            &larr; Volver al Panel
                        </Link>
                    </div>
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
                                        <tr key={order._id} className="border-b hover:bg-gray-50">
                                            <td className="text-black py-3 px-6 font-mono">#...{order._id.slice(-6)}</td>
                                            <td className="text-black py-3 px-6">{order.cliente_nombre}</td>
                                            <td className="text-black py-3 px-6">{order.fecha ? new Date(order.fecha).toLocaleString() : ''}</td>
                                            <td className="text-black py-3 px-6 text-right">${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</td>
                                            <td className="text-black py-3 px-6 text-center">
                                                <span className={`text-black py-1 px-3 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}> 
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <select
                                                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                    value={order.status}
                                                    className="text-black bg-gray-200 border rounded p-1 text-xs mr-2"
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Enviado">Enviado</option>
                                                    <option value="Completado">Completado</option>
                                                    <option value="Cancelado">Cancelado</option>
                                                </select>
                                                <button onClick={() => handleDeleteOrder(order._id)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">
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