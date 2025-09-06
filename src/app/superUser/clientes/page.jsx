'use client';

import { useState } from 'react';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';
import { useClients } from '@/hooks/useClients';

export default function ClientManagementPage() {
    const { clients, loading, error, fetchClients } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState({ id: null, nombre: '', correo: '', telefono: '' });
    const [apiError, setApiError] = useState('');

    const handleOpenModal = (client = null) => {
        setApiError('');
        if (client) {
            setIsEditing(true);
            setCurrentClient(client);
        } else {
            setIsEditing(false);
            setCurrentClient({ id: null, nombre: '', correo: '', telefono: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = '/api/clients';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentClient),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente`);
            }

            alert(`¡Cliente ${isEditing ? 'actualizado' : 'creado'} exitosamente!`);
            handleCloseModal();
            fetchClients();
        } catch (err) {
            setApiError(err.message);
        }
    };

    const handleDelete = async (clientId, clientName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a "${clientName}"?`)) {
            try {
                const res = await fetch(`/api/clients?id=${clientId}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar el cliente');
                }
                alert('¡Cliente eliminado exitosamente!');
                fetchClients();
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
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Clientes</h1>
                    <div>
                        <button onClick={() => handleOpenModal()} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors mr-4">
                            + Crear Cliente
                        </button>
                        <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            &larr; Volver al Panel
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p>Cargando clientes...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-black py-3 px-6 text-left">ID</th>
                                        <th className="text-black py-3 px-6 text-left">Nombre</th>
                                        <th className="text-black py-3 px-6 text-left">Correo</th>
                                        <th className="text-black py-3 px-6 text-left">Teléfono</th>
                                        <th className="text-black py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.id} className="border-b hover:bg-gray-50">
                                            <td className="text-black py-3 px-6">{client.id}</td>
                                            <td className="text-black py-3 px-6 font-medium">{client.nombre}</td>
                                            <td className="text-black py-3 px-6">{client.correo}</td>
                                            <td className="text-black py-3 px-6">{client.telefono}</td>
                                            <td className="text-black py-3 px-6 text-center">
                                                <button onClick={() => handleOpenModal(client)} className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600 mr-2">Editar</button>
                                                <button onClick={() => handleDelete(client.id, client.nombre)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">Eliminar</button>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-black text-2xl font-bold mb-6">{isEditing ? 'Editar' : 'Crear'} Cliente</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="text-black block text-sm font-bold mb-2">Nombre</label>
                                <input type="text" name="nombre" value={currentClient.nombre} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="correo" className="text-black block text-sm font-bold mb-2">Correo Electrónico</label>
                                <input type="email" name="correo" value={currentClient.correo} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="telefono" className="text-black block text-sm font-bold mb-2">Teléfono</label>
                                <input type="text" name="telefono" value={currentClient.telefono} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            {apiError && <p className="text-red-500 text-xs italic mb-4">{apiError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{isEditing ? 'Actualizar' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}