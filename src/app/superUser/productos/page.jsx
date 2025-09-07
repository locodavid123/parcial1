'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts'; // Hook para manejar productos

export default function ProductManagementPage() {
    const router = useRouter();
    const { products, loading, error, fetchProducts } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Estado inicial del producto, coincidiendo con los campos del formulario y la base de datos
    const [currentProduct, setCurrentProduct] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        imageurl: '',
    });
    const [apiError, setApiError] = useState('');

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

    const handleOpenModal = (product = null) => {
        setApiError('');
        if (product) {
            setIsEditing(true);
            // Asegurarse de que todos los campos del producto se cargan en el estado
            setCurrentProduct({
                id: product.id,
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: product.precio || '',
                stock: product.stock || '',
                imageurl: product.imageurl || '',
            });
        } else {
            setIsEditing(false);
            // Resetear el formulario para un nuevo producto
            setCurrentProduct({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: '',
                imageurl: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        
        // Asegurarse de que los valores numéricos se envían como números
        const productData = {
            ...currentProduct,
            precio: parseFloat(currentProduct.precio),
            stock: parseInt(currentProduct.stock, 10),
        };
        
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = '/api/products';
        const body = JSON.stringify(productData);

        try {
            const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`);
            }
            alert(`¡Producto ${isEditing ? 'actualizado' : 'creado'} exitosamente!`);
            handleCloseModal();
            fetchProducts();
        } catch (err) {
            setApiError(err.message);
        }
    };

    const handleDelete = async (productId, productName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
            try {
                const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error al eliminar el producto');
                }
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
                        <button onClick={() => handleOpenModal()} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors mr-4">
                            + Crear Producto
                        </button>
                        <Link href="/superUser" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
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
                                        <th className="text-black py-3 px-6 text-left">Imagen</th>
                                        <th className="text-black py-3 px-6 text-left">Nombre</th>
                                        <th className="text-black py-3 px-6 text-left">Descripción</th>
                                        <th className="text-black py-3 px-6 text-center">Stock</th>
                                        <th className="text-black py-3 px-6 text-right">Precio</th>
                                        <th className="text-black py-3 px-6 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="text-black py-3 px-6">
                                                <Image
                                                    src={product.imageurl || '/images/placeholder.png'} // Corregido a 'imageurl' y con imagen por defecto
                                                    alt={product.nombre}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                            </td>
                                            <td className="text-black py-3 px-6 font-medium">{product.nombre}</td>
                                            <td className="text-black py-3 px-6 text-sm max-w-xs truncate">{product.descripcion}</td>
                                            <td className="text-black py-3 px-6 text-center">{product.stock}</td>
                                            <td className="text-black py-3 px-6 text-right">${parseFloat(product.precio).toFixed(2)}</td>
                                            <td className="text-black py-3 px-6 text-center">
                                                <button onClick={() => handleOpenModal(product)} className="bg-indigo-500 text-white py-1 px-3 rounded text-xs hover:bg-indigo-600 mr-2">Editar</button>
                                                <button onClick={() => handleDelete(product.id, product.nombre)} className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600">Eliminar</button>
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

            {/* Modal para Crear/Editar Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-black text-2xl font-bold mb-6">{isEditing ? 'Editar' : 'Crear'} Producto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="nombre" className="text-black block text-sm font-bold mb-2">Nombre del Producto</label>
                                <input type="text" name="nombre" value={currentProduct.nombre} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="descripcion" className="text-black block text-sm font-bold mb-2">Descripción</label>
                                <textarea name="descripcion" value={currentProduct.descripcion} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" rows="3"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="precio" className="text-black block text-sm font-bold mb-2">Precio</label>
                                    <input type="number" name="precio" value={currentProduct.precio} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required step="0.01" />
                                </div>
                                <div>
                                    <label htmlFor="stock" className="text-black block text-sm font-bold mb-2">Stock</label>
                                    <input type="number" name="stock" value={currentProduct.stock} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required step="1" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="imageurl" className="text-black block text-sm font-bold mb-2">URL de la Imagen</label>
                                <input type="text" name="imageurl" value={currentProduct.imageurl} onChange={handleInputChange} className="text-black shadow border rounded w-full py-2 px-3" required />
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
