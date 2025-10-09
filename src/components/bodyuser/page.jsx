'use client'; // Necesario para usar hooks como useState y manejar eventos onClick

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts'; // Importar el hook de productos
import { useCart } from '@/context/CartContext'; // Importar el contexto del carrito

// Ícono del carrito de compras (puedes usar una librería como react-icons en un proyecto real)
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export default function BodyUser() {
    const { products, loading, error } = useProducts(); // Usar el hook para obtener productos
    const { addToCart, cartItems } = useCart(); // Usar el contexto del carrito

    // Función para agregar un producto al carrito
    const handleAddToCart = (product) => {
        addToCart({ ...product, quantity: 1 }); // Añadir una unidad por defecto
        alert(`"${product.nombre}" ha sido agregado al carrito.`);
    };

    return (
        <main className="bg-gray-50 py-12 relative">
            {/* Botón flotante del carrito de compras */}
            <div className="fixed top-24 right-4 z-10">
                <button className="bg-yellow-500 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 hover:bg-yellow-600 transition-colors">
                    <ShoppingCartIcon />
                    <span className="font-bold text-lg">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </button>
            </div>

            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    ¡Hola, Cliente! Elige tus favoritos
                </h2>
                {loading && <p className="text-center">Cargando productos...</p>}
                {error && <p className="text-center text-red-500">Error al cargar productos.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src={product.imageUrl} alt={product.nombre} className="w-full h-56 object-cover" />
                            <div className="p-6 flex flex-col h-full">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.nombre}</h3>
                                <p className="text-gray-600 mb-4 flex-grow">{product.descripcion}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-bold text-gray-900">${parseFloat(product.precio).toFixed(2)}</span>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}