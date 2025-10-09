'use client';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import { useState, useEffect } from 'react';

export default function ReportesPage() {
    const [isDownloading, setIsDownloading] = useState(false);

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

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
                    Reportes
                </h1>
                <p className="text-lg text-center text-gray-600 mb-12">
                    Genera los reportes necesarios para la gestión del sistema.
                </p>

                <div className="flex justify-center items-start">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Reporte de Inventario
                        </h2>
                        <button onClick={handleDownloadReport} disabled={isDownloading} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isDownloading ? 'Generando reporte...' : 'Imprimir Inventario (PDF)'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}