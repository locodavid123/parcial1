'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

export default function AdminClientManagementPage() {
    const router = useRouter();
    const { clients, loading, error, fetchClients } = useClients();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            if (parsedUser.rol !== 'administador' && parsedUser.rol !== 'SUPERUSER') {
                router.push('/');
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleEditClick = (client) => {
        setEditingClient({ ...client });
        setIsEditModalOpen(true);
        setUpdateError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingClient(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        if (!editingClient) return;
        setUpdateError('');

        try {
            const res = await fetch('/api/clientes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: editingClient.id, 
                    nombre: editingClient.nombre,
                    correo: editingClient.correo,
                    telefono: editingClient.telefono
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el cliente');
            }

            setIsEditModalOpen(false);
            fetchClients();
            alert('¡Cliente actualizado exitosamente!');
        } catch (err) {
            setUpdateError(err.message);
        }
    };

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        Gestión de Clientes
                    </h1>
                    <div className="flex items-center">
                        <Link href="/admin" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            &larr; Volver al Panel
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p className="text-center text-gray-600">Cargando clientes...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                                    <tr>
                                        <th className="py-3 px-6 text-left">ID</th>
                                        <th className="py-3 px-6 text-left">Nombre</th>
                                        <th className="py-3 px-6 text-left">Correo Electrónico</th>
                                        <th className="py-3 px-6 text-left">Teléfono</th>
                                        <th className="py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm font-light">
                                    {clients.map((client) => (
                                        <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap">{client.id}</td>
                                            <td className="py-3 px-6 text-left">{client.nombre}</td>
                                            <td className="py-3 px-6 text-left">{client.correo}</td>
                                            <td className="py-3 px-6 text-left">{client.telefono || 'N/A'}</td>
                                            <td className="py-3 px-6 text-center">
                                                <button
                                                    onClick={() => handleEditClick(client)}
                                                    className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600"
                                                >Editar</button>
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

            {/* Modal para editar un cliente */}
            {isEditModalOpen && editingClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Cliente</h2>
                        <form onSubmit={handleUpdateClient}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                                <input type="text" name="nombre" id="nombre" value={editingClient.nombre} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                                <input type="email" name="correo" id="correo" value={editingClient.correo} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="telefono" className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                                <input type="tel" name="telefono" id="telefono" value={editingClient.telefono || ''} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            {updateError && <p className="text-red-500 text-xs italic mb-4">{updateError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancelar</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Actualizar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}