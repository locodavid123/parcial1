
'use client';

import { useState, useEffect } from 'react';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

// Hook para obtener productos
function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/admin/productos/auth');
            if (!res.ok) throw new Error("Error al cargar productos");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(err.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, error, fetchProducts };
}

export default function ProductManagementPage() {
    const { products, loading, error, fetchProducts } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ id: null, nombre: '', descripcion: '', precio: '', stock: '' });
    const [apiError, setApiError] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            setUserRole(JSON.parse(loggedInUser).rol);
        }
    }, []);

    const handleOpenModal = (product) => {
        setApiError('');
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        try {
            const res = await fetch('/admin/productos/auth', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProduct),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el producto');
            }

            alert('¡Producto actualizado exitosamente!');
            handleCloseModal();
            fetchProducts();
        } catch (err) {
            setApiError(err.message);
        }
    };

    const handleDelete = async (productId, productName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
            try {
                const res = await fetch(`/admin/productos/auth?id=${productId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar el producto');
                alert('¡Producto eliminado exitosamente!');
                fetchProducts();
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
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Productos</h1>
                    <div>
                        {/* El botón de crear solo es visible para el SUPERUSER */}
                        {userRole === 'SUPERUSER' && (
                            <button onClick={() => alert('La creación de productos se maneja en otro panel.')} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors mr-4">
                                + Crear Producto
                            </button>
                        )}
                        <Link href={userRole === 'SUPERUSER' ? "/superUser" : "/admin"} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            &larr; Volver al Panel
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && <p>Cargando productos...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-black py-3 px-6 text-left">Nombre</th>
                                        <th className="text-black py-3 px-6 text-left">Descripción</th>
                                        <th className="text-black py-3 px-6 text-left">Precio</th>
                                        <th className="text-black py-3 px-6 text-left">Stock</th>
                                        <th className="text-black py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="text-black py-3 px-6 font-medium">{product.nombre}</td>
                                            <td className="text-black py-3 px-6">{product.descripcion}</td>
                                            <td className="text-black py-3 px-6">${product.precio}</td>
                                            <td className="text-black py-3 px-6">{product.stock}</td>
                                            <td className="text-black py-3 px-6 text-center">
                                                <button onClick={() => handleOpenModal(product)} className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600 mr-2">Editar</button>
                                                {/* El botón de eliminar es visible para SUPERUSER y administrador */}
                                                {(userRole === 'SUPERUSER' || userRole === 'administador') && (
                                                    <button onClick={() => handleDelete(product.id, product.nombre)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">Eliminar</button>
                                                )}
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
                        <h2 className="text-black text-2xl font-bold mb-6">Editar Producto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-black block text-sm font-bold mb-2">Nombre</label>
                                <input type="text" name="nombre" value={currentProduct.nombre} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-4">
                                <label className="text-black block text-sm font-bold mb-2">Descripción</label>
                                <textarea name="descripcion" value={currentProduct.descripcion} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-4">
                                <label className="text-black block text-sm font-bold mb-2">Precio</label>
                                <input type="number" name="precio" value={currentProduct.precio} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-6">
                                <label className="text-black block text-sm font-bold mb-2">Stock</label>
                                <input type="number" name="stock" value={currentProduct.stock} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            {apiError && <p className="text-red-500 text-xs italic mb-4">{apiError}</p>}
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Actualizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}