'use client'; // Necesario para usar hooks como useState y manejar eventos onClick

import React, { useState } from 'react';

// Ícono del carrito de compras (puedes usar una librería como react-icons en un proyecto real)
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export default function BodyUser() {
    // Estado para mantener los ítems en el carrito. Es un estado local simple.
    const [cartItems, setCartItems] = useState([]);

    const products = [
        {
            id: 1,
            name: 'Chunchulla Frita Crocante',
            description: 'Nuestra especialidad. Crujiente por fuera, tierna por dentro. Servida con limón y ají casero.',
            price: '$15.000',
            imageUrl: 'https://donjediondo.com/wp-content/uploads/2024/10/6.-Chunchullo-Papa-Criolla.png'
        },
        {
            id: 2,
            name: 'Chunchulla a la Parrilla',
            description: 'Asada a la perfección en nuestra parrilla, con un toque ahumado inigualable. Acompañada de papa criolla.',
            price: '$18.000',
            imageUrl: 'https://www.infobae.com/new-resizer/2MmG5ZeqZDQNY9yw3dWaPc-1u-Y=/arc-anglerfish-arc2-prod-infobae/public/JCRSL37AIBBPHMQMIS2UDEXTU4.jpg'
        },
        {
            id: 3,
            name: 'Picada "El Chuncho Mayor"',
            description: 'Una generosa porción de chunchulla, chorizo, morcilla, papa y arepa. Ideal para compartir.',
            price: '$35.000',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3pajraXNoKiwFyxroHhnOCLViids1ZBhXxw&s'
        },
        {
            id: 4,
            name: 'Empanadas de Chunchulla',
            description: 'Deliciosas empanadas rellenas de un guiso único de chunchulla. (Orden de 5 unidades).',
            price: '$12.000',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjmK436o4dTRzgZ5yJbBpfr3QA6OTJ6gcrg&s'
        },
        {
            id: 5,
            name: 'Sopa de Chunchulla',
            description: 'Una sopa tradicional y reconfortante, con trozos de chunchulla, papa y especias de la casa.',
            price: '$16.000',
            imageUrl: 'https://i0.wp.com/www.ranchomateo.com/north-bergen/wp-content/uploads/sites/7/2024/10/Blood-sausage.-4-1.jpg?fit=1400%2C800&ssl=1'
        }
    ];

    // Función para agregar un producto al carrito
    const handleAddToCart = (product) => {
        setCartItems(prevItems => [...prevItems, product]);
        alert(`"${product.name}" ha sido agregado al carrito.`);
        // En una aplicación real, aquí se actualizaría un estado global o se haría una llamada a la API.
    };

    return (
        <main className="bg-gray-50 py-12 relative">
            {/* Botón flotante del carrito de compras */}
            <div className="fixed top-24 right-4 z-10">
                <button className="bg-yellow-500 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 hover:bg-yellow-600 transition-colors">
                    <ShoppingCartIcon />
                    <span className="font-bold text-lg">{cartItems.length}</span>
                </button>
            </div>

            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    ¡Hola, Cliente! Elige tus favoritos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover" />
                            <div className="p-6 flex flex-col h-full">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-bold text-gray-900">{product.price}</span>
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