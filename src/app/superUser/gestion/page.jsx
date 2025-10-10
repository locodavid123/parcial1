'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

export default function UserManagementPage() {
    const router = useRouter();
    const { users, loading, error, fetchUsers } = useUsers();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        nombre: '',
        correo: '',
        contraseña: '',
        telefono: '',
        rol: 'Cliente', // Rol por defecto
    });
    const [creationError, setCreationError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            if (parsedUser.rol !== 'SUPERUSER') {
                // Si no es un SUPERUSER, lo redirige a la página principal
                router.push('/');
            }
        } else {
            // Si no ha iniciado sesión, lo redirige al login
            router.push('/login');
        }
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreationError('');
        try {
            const res = await fetch('/superUser/gestion/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al crear el usuario');
            }

            setIsCreateModalOpen(false);
            setNewUser({ // Limpiar el formulario
                nombre: '',
                correo: '',
                contraseña: '',
                telefono: '',
                rol: 'Cliente',
            });
            fetchUsers(); // Recargar la lista de usuarios
            alert('¡Usuario creado exitosamente!');
        } catch (err) {
            setCreationError(err.message);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
            try { // Se corrige el endpoint para la API
                const res = await fetch(`/superUser/gestion/api?id=${userId}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar el usuario');
                }

                alert('¡Usuario eliminado exitosamente!');
                fetchUsers(); // Recargar la lista de usuarios
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingUser({ ...user });
        setIsEditModalOpen(true);
        setUpdateError('');
    };

    const handleRoleChange = (e) => {
        setEditingUser(prev => ({ ...prev, rol: e.target.value }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setUpdateError('');

        try {
            const res = await fetch('/superUser/gestion/api', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: editingUser._id, rol: editingUser.rol }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el usuario');
            }

            setIsEditModalOpen(false);
            fetchUsers();
            alert('¡Rol de usuario actualizado exitosamente!');
        } catch (err) {
            setUpdateError(err.message);
        }
    };

    // Función para dar estilo a los roles
    const getRoleClass = (rol) => {
        switch (rol) {
            case 'SUPERUSER':
                return 'bg-red-200 text-red-800';
            case 'Administrador':
                return 'bg-yellow-200 text-yellow-800';
            case 'Cliente':
                return 'bg-green-200 text-green-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        Gestión de Usuarios
                    </h1>
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors mr-4">
                            + Crear Usuario
                        </button>
                        <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            &larr; Volver al Panel
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p className="text-center text-gray-600">Cargando usuarios...</p>}
                    {error && <p className="text-center text-red-500">Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.</p>}
                    
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                                    <tr>
                                        <th className="py-3 px-6 text-left">ID</th>
                                        <th className="py-3 px-6 text-left">Nombre</th>
                                        <th className="py-3 px-6 text-left">Correo Electrónico</th>
                                        <th className="py-3 px-6 text-center">Rol</th>
                                        <th className="py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm font-light">
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap">{user._id}</td>
                                            <td className="py-3 px-6 text-left">{user.nombre}</td>
                                            <td className="py-3 px-6 text-left">{user.correo}</td>
                                            <td className="py-3 px-6 text-center">
                                                <span className={`py-1 px-3 rounded-full text-xs font-semibold ${getRoleClass(user.rol)}`}>
                                                    {user.rol || 'No asignado'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600 mr-2"
                                                >Editar</button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.nombre)}
                                                    className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                                                >Eliminar</button>
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

            {/* Modal para crear un nuevo usuario */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Usuario</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                                <input type="text" name="nombre" id="nombre" value={newUser.nombre} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="correo" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                                <input type="email" name="correo" id="correo" value={newUser.correo} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="contraseña" className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                                <input type="password" name="contraseña" id="contraseña" value={newUser.contraseña} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="telefono" className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                                <input type="tel" name="telefono" id="telefono" value={newUser.telefono} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="rol" className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                                <select name="rol" id="rol" value={newUser.rol} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="Cliente">Cliente</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="SUPERUSER">SUPERUSER</option>
                                </select>
                            </div>
                            {creationError && <p className="text-red-500 text-xs italic mb-4">{creationError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancelar</button>
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Crear Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar un usuario */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Rol de Usuario</h2>
                        <form onSubmit={handleUpdateUser}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
                                <p className="text-gray-800 bg-gray-100 p-2 rounded">{editingUser.nombre} ({editingUser.correo})</p>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="rol" className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                                <select name="rol" id="rol" value={editingUser.rol} onChange={handleRoleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="Cliente">Cliente</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="SUPERUSER">SUPERUSER</option>
                                </select>
                            </div>
                            {updateError && <p className="text-red-500 text-xs italic mb-4">{updateError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancelar</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Actualizar Rol</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
