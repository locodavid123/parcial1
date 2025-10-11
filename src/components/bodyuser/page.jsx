'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';

// Componente para el ícono del carrito
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Componente para cada tarjeta de producto (con la corrección aplicada)
const ProductCard = ({ product, addToCart }) => {
    // 1. El estado de la cantidad ahora es local para cada tarjeta.
    const [quantity, setQuantity] = useState(1);

    // 2. Resetea la cantidad a 1 si el producto cambia (buena práctica).
    useEffect(() => {
        setQuantity(1);
    }, [product]);

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleAddToCart = () => {
        // 3. Usa la cantidad local de esta tarjeta específica.
        addToCart(product, quantity);
        alert(`${quantity} x ${product.nombre} agregado(s) al carrito.`);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src={product.imageUrl || '/placeholder.png'} alt={product.nombre} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.nombre}</h3>
                <p className="text-gray-600 text-sm mt-1">{product.descripcion}</p>
                <div className="flex justify-between items-center mt-4">
                    {/* CORRECCIÓN: Asegurarse de que el precio sea un número antes de formatearlo */}
                    <span className="text-xl font-bold text-gray-900">${(typeof product.precio === 'number' ? product.precio : parseFloat(product.precio) || 0).toFixed(2)}</span>
                    <div className="flex items-center">
                        <button onClick={() => handleQuantityChange(-1)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l">-</button>
                        <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                        <button onClick={() => handleQuantityChange(1)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r">+</button>
                    </div>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Agregar al Carrito
                </button>
            </div>
        </div>
    );
};

// Componente principal que muestra la lista de productos
export default function BodyUser() {
    const { products, loading, error } = useProducts();
    const { cartItems, addToCart } = useCart();
    // 4. Se elimina el estado de cantidad centralizado de aquí.

    if (loading) return <p className="text-center text-gray-600 py-12">Cargando productos...</p>;
    if (error) return <p className="text-center text-red-500 py-12">Error al cargar productos: {error}</p>;

    return (
        <main className="bg-gray-50 py-12 relative">
            {/* Botón flotante del carrito de compras */}
            <Link href="/checkout" className="fixed top-24 right-4 z-10">
                <div className="bg-yellow-500 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 hover:bg-yellow-600 transition-colors">
                    <ShoppingCartIcon />
                    <span className="font-bold text-lg">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
            </Link>

            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Nuestros Productos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            addToCart={addToCart}
                            // 5. Ya no se pasan las props 'quantity' y 'setQuantity'
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
