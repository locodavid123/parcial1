'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ClientePage() {
    const [user, setUser] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPedidos, setShowPedidos] = useState(false);
    const [cancelingId, setCancelingId] = useState(null); // Para el estado de carga del botón cancelar
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            router.push('/login');
        } else {
            const parsedUser = JSON.parse(loggedInUser);
            setUser(parsedUser);
            fetchPedidos(parsedUser.id);
        }
    }, [router]);

    const fetchPedidos = async (clienteId) => {
        setLoading(true);
        setError('');
        try {
            // Pasamos el ID del usuario para filtrar los pedidos
            const res = await fetch(`/api/orders?cliente_id=${clienteId}`);
            if (!res.ok) {
                throw new Error('No se pudieron cargar los pedidos.');
            }
            const data = await res.json();
            setPedidos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('loggedInUser');
            router.push('/login');
        }
    };

    const handleCancelOrder = async (pedidoId) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.')) {
            return;
        }

        setCancelingId(pedidoId);
        setError('');

        try {
            const res = await fetch(`/api/orders?id=${pedidoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelado' }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'No se pudo cancelar el pedido.');
            }

            // Actualizar la lista de pedidos en el estado para reflejar el cambio
            setPedidos(prevPedidos =>
                prevPedidos.map(p => p._id === pedidoId ? { ...p, estatus: 'cancelado' } : p)
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setCancelingId(null);
        }
    };

    const generatePDF = (pedido) => {
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(20);
        doc.text('Recibo de Compra', 14, 22);

        // Información del cliente y del pedido
        doc.setFontSize(12);
        doc.text(`ID del Pedido: ${pedido._id}`, 14, 32);
        doc.text(`Cliente: ${user?.nombre || 'N/A'}`, 14, 38);
        doc.text(`Correo: ${user?.correo || 'N/A'}`, 14, 44);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, 50);

        // Definir las columnas y filas para la tabla de productos
        const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
        const tableRows = [];

        pedido.detalles.forEach(item => {
            const subtotal = (item.cantidad * item.precio_unitario).toFixed(2);
            const rowData = [
                item.producto_id, // Idealmente aquí se mostraría el nombre del producto
                item.cantidad,
                `$${item.precio_unitario.toFixed(2)}`,
                `$${subtotal}`
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 60 });
        doc.text(`Total del Pedido: $${parseFloat(pedido.total).toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
        doc.output('dataurlnewwindow');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Cargando panel de cliente...</div>
            </div>
        );
    }

    return (
        <>
            <Headers />
            <main className="container mx-auto px-4 py-8 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Panel de Cliente</h1>
                            <p className="text-gray-600 mt-2">Bienvenido, <span className="font-semibold">{user?.nombre}</span>.</p>
                            <p className="text-sm text-gray-500">{user?.correo}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    {/* Botones de acción principales */}
                    <div className="mt-8 border-t pt-6">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-green-500 text-white py-2 px-5 rounded-md hover:bg-green-600 transition-colors w-full text-left mb-4"
                        >
                            Realizar Pedido
                        </button>
                        <button
                            onClick={() => setShowPedidos(!showPedidos)}
                            className="bg-blue-500 text-white py-2 px-5 rounded-md hover:bg-blue-600 transition-colors w-full text-left"
                        >
                            {showPedidos ? 'Ocultar Historial de Pedidos' : 'Ver Historial de Pedidos'}
                        </button>

                        {showPedidos && (
                            <div className="mt-6">
                                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                                {pedidos.length > 0 ? (
                                    <ul className="space-y-4">
                                        {pedidos.map(pedido => (
                                            <li key={pedido._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">Pedido #{pedido._id.slice(-6)}</p>
                                                        <p className="text-sm text-gray-600">Fecha: {new Date(pedido.fecha).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                        pedido.estatus === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                                                        pedido.estatus === 'completado' ? 'bg-green-200 text-green-800' :
                                                        'bg-red-200 text-red-800'
                                                    }`}>
                                                        {pedido.estatus}
                                                    </span>
                                                </div>
                                                <div className="mt-3 border-t pt-3">
                                                    <p className="text-gray-800 font-semibold">
                                                        Total: ${parseFloat(pedido.total).toFixed(2)}
                                                    </p>
                                                    <div className="mt-4 flex justify-end items-center space-x-4">
                                                        <button
                                                            onClick={() => generatePDF(pedido)}
                                                            className="bg-gray-500 text-white text-sm py-1 px-3 rounded-md hover:bg-gray-600 transition-colors"
                                                        >
                                                            Ver Recibo
                                                        </button>
                                                        {pedido.estatus === 'pendiente' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(pedido._id)}
                                                                disabled={cancelingId === pedido._id}
                                                                className="bg-red-500 text-white text-sm py-1 px-3 rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                                                            >
                                                                {cancelingId === pedido._id ? 'Cancelando...' : 'Cancelar Pedido'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 mt-4">No has realizado ningún pedido aún.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
