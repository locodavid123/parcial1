'use client';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ReportesPage() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [ventas, setVentas] = useState([]);
    const [loadingVentas, setLoadingVentas] = useState(true);
    const [errorVentas, setErrorVentas] = useState(null);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                setLoadingVentas(true);
                const response = await fetch('/api/orders');
                if (!response.ok) {
                    throw new Error('Error al obtener el reporte de ventas.');
                }
                const data = await response.json();
                setVentas(data);
            } catch (error) {
                setErrorVentas(error.message);
            } finally {
                setLoadingVentas(false);
            }
        };
        fetchVentas();
    }, []);

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/inventory/print');

            if (!response.ok) {
                throw new Error('No se pudo generar el reporte. El servidor respondió con un error.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte-inventario.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error al descargar el reporte:', error);
            alert(error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    const totalVentas = ventas.reduce((acc, venta) => acc + venta.total, 0);
    const numeroDeVentas = ventas.length;

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Reportes</h1>
                    <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                        &larr; Volver al Panel
                    </Link>
                </div>


                <p className="text-lg text-gray-600 mb-12">
                    Genera los reportes necesarios para la gestión del sistema.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Reporte de Inventario */}
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Reporte de Inventario
                        </h2>
                        <button onClick={handleDownloadReport} disabled={isDownloading} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isDownloading ? 'Generando reporte...' : 'Imprimir Inventario (PDF)'}
                        </button>
                    </div>

                    {/* Reporte de Ventas Completadas */}
                    <div className="bg-white p-8 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                            Reporte de Ventas Completadas
                        </h2>
                        {loadingVentas && <p className="text-center">Cargando ventas...</p>}
                        {errorVentas && <p className="text-center text-red-500">{errorVentas}</p>}
                        {!loadingVentas && !errorVentas && (
                            <>
                                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
                                    <p className="text-lg font-semibold text-gray-800">Total de Ventas: <span className="text-green-600">${totalVentas.toLocaleString('es-CO')}</span></p>
                                    <p className="text-md text-gray-600">Número de Pedidos: {numeroDeVentas}</p>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Cliente
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {ventas.map((venta) => (
                                                <tr key={venta._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {venta.cliente?.nombre || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {format(new Date(venta.fecha), 'dd/MM/yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        ${venta.total.toLocaleString('es-CO')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}