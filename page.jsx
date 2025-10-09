'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const router = useRouter();

    // Efecto para proteger la ruta y solo permitir administradores
    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            // Permitir acceso a roles 'administador' o 'SUPERUSER'
            if (parsedUser.rol === 'administador' || parsedUser.rol === 'SUPERUSER') {
                setUser(parsedUser);
                setLoading(false);
            } else {
                // Si no es admin, redirige a la página principal
                router.push('/');
            }
        } else {
            // Si no ha iniciado sesión, redirige al login
            router.push('/login');
        }
    }, [router]);

    // Función para manejar la descarga del reporte
    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/inventory/print');

            if (!response.ok) {
                throw new Error('No se pudo generar el reporte. El servidor respondió con un error.');
            }

            // Convertir la respuesta en un Blob (un objeto tipo archivo)
            const blob = await response.blob();
            // Crear una URL para el Blob
            const url = window.URL.createObjectURL(blob);
            // Crear un enlace temporal para iniciar la descarga
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte-inventario.pdf'; // Nombre del archivo a descargar
            document.body.appendChild(a);
            a.click();
            // Limpiar
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error al descargar el reporte:', error);
            alert(error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Headers />
            <main className="flex-1 container mx-auto p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel de Administración</h1>
                <p className="text-xl text-gray-600 mb-10">Bienvenido, {user?.nombre}.</p>
                <button onClick={handleDownloadReport} disabled={isDownloading} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isDownloading ? 'Generando reporte...' : 'Imprimir Inventario (PDF)'}
                </button>
            </main>
            <Footer />
        </div>
    );
}
