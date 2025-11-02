'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SuperUserOrdersPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(null); // Para el estado de carga

    // Hook para verificar el rol de SUPERUSER
    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            if (parsedUser.rol !== 'SUPERUSER') {
                router.push('/');
            } else {
                fetchPedidos();
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    // Función para obtener todos los pedidos
    const fetchPedidos = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/orders'); // Llama a la API sin filtros para obtener todos
            if (!res.ok) {
                throw new Error('Error al cargar los pedidos');
            }
            const data = await res.json();
            setPedidos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la actualización de estado
    const handleUpdateStatus = async (pedidoId, newStatus) => {
        setUpdatingStatus(pedidoId);
        setError('');
        try {
            const res = await fetch(`/api/orders?id=${pedidoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el estado');
            }

            // SOLUCIÓN: Actualizar el estado local para reflejar el cambio inmediatamente
            setPedidos(prevPedidos =>
                prevPedidos.map(p =>
                    p._id === pedidoId ? { ...p, estatus: newStatus } : p
                )
            );

            alert('¡Estado del pedido actualizado exitosamente!');
        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Función para generar el PDF de un pedido
    const generatePDF = (pedido) => {
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(20);
        doc.text('Detalle del Pedido', 14, 22);

        // Información del cliente y del pedido
        doc.setFontSize(12);
        doc.text(`ID del Pedido: ${pedido._id}`, 14, 32);
        doc.text(`Cliente: ${pedido.cliente?.nombre || 'N/A'}`, 14, 38);
        doc.text(`Correo: ${pedido.cliente?.correo || 'N/A'}`, 14, 44);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, 50);

        // Definir las columnas y filas para la tabla de productos
        const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
        const tableRows = [];

        pedido.detalles.forEach(item => {
            const subtotal = (item.cantidad * item.precio_unitario).toFixed(2);
            const rowData = [
                item.producto_id, // Idealmente aquí tendrías el nombre del producto
                item.cantidad,
                `$${item.precio_unitario.toFixed(2)}`,
                `$${subtotal}`
            ];
            tableRows.push(rowData);
        });

        // Generar la tabla
        doc.autoTable(tableColumn, tableRows, { startY: 60 });
        doc.text(`Total del Pedido: $${parseFloat(pedido.total).toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);

        // Guardar el PDF
        doc.save(`pedido_${pedido._id}.pdf`);
    };

    // Función para dar estilo a los estados
    const getStatusClass = (status) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-200 text-yellow-800';
            case 'completado': return 'bg-green-200 text-green-800';
            case 'cancelado': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
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
                    {loading && <p className="text-center text-gray-600">Cargando pedidos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                                    <tr>
                                        <th className="py-3 px-6 text-left">ID Pedido</th>
                                        <th className="py-3 px-6 text-left">Cliente</th>
                                        <th className="py-3 px-6 text-left">Fecha</th>
                                        <th className="py-3 px-6 text-right">Total</th>
                                        <th className="py-3 px-6 text-center">Estado</th>
                                        <th className="py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm">
                                    {pedidos.map((pedido) => (
                                        <tr key={pedido._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap font-mono">{pedido._id.slice(-6)}</td>
                                            <td className="py-3 px-6 text-left">{pedido.cliente?.nombre || 'N/A'}</td>
                                            <td className="py-3 px-6 text-left">{new Date(pedido.fecha).toLocaleDateString()}</td>
                                            <td className="py-3 px-6 text-right font-semibold">${parseFloat(pedido.total).toFixed(2)}</td>
                                            <td className="py-3 px-6 text-center">
                                                <span className={`py-1 px-3 rounded-full text-xs font-semibold ${getStatusClass(pedido.estatus)}`}>
                                                    {pedido.estatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <select
                                                    value={pedido.estatus}
                                                    onChange={(e) => handleUpdateStatus(pedido._id, e.target.value)}
                                                    disabled={updatingStatus === pedido._id}
                                                    className="border rounded p-1 text-xs disabled:opacity-50"
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="completado">Completado</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                                <button
                                                    onClick={() => generatePDF(pedido)}
                                                    className="ml-2 bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600 transition-colors text-xs"
                                                >
                                                    PDF
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