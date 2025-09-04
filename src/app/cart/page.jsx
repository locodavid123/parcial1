"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer/page";
import { useCart } from "@/context/CartContext";
import Headers from "@/components/Headers/page";


export default function Cart() {
    const { cartItems = [], removeFromCart, clearCart } = useCart() || {};
    const router = useRouter();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('loggedInUser');
            if (user) {
                setLoggedInUser(JSON.parse(user));
            }
        }
    }, []);

    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.quantity * parseFloat(item.precio);
    }, 0);

    const handlePlaceOrder = async () => {
        if (!loggedInUser) {
            alert('Debes iniciar sesión para hacer un pedido.');
            router.push('/login');
            return;
        }

        setIsPlacingOrder(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_info: loggedInUser,
                    total: totalPrice,
                    items: cartItems,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al procesar el pedido.');
            }

            alert('¡Pedido realizado con éxito!');
            clearCart();
            router.push('/'); // Redirigir a la página de inicio
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Headers />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold my-8 text-center text-gray-800">Tu Carrito de Compras</h1>
                {cartItems.length === 0 ? (
                    <p className="text-black text-center">Tu carrito está vacío.</p>
                ) : (
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                        <ul className="divide-y divide-gray-200">
                            {cartItems.map((item) => (
                                <li key={item.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg text-black font-semibold">{item.nombre}</h2>
                                        <p className="text-sm text-black">Cantidad: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <p className="text-lg font-medium text-gray-800">
                                            ${(item.quantity * parseFloat(item.precio)).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="ml-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-black text-xl font-bold text-right">Total: ${totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="bg-green-500 text-white font-bold py-2 px-6 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                            >
                                {isPlacingOrder ? 'Procesando...' : 'Hacer Pedido'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}