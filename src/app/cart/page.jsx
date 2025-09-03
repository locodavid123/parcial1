"use client";

import Footer from "@/components/Footer/page";
import { useCart } from "@/context/CartContext";


export default function Cart() {
    const { cartItems = [], removeFromCart } = useCart() || {};

    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.quantity * parseFloat(item.unit_price);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold my-8 text-center text-gray-800">Tu Carrito de Compras</h1>
                {cartItems.length === 0 ? (
                    <p className="text-black text-center">Tu carrito está vacío.</p>
                ) : (
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                        <ul className="divide-black">
                            {cartItems.map(item => (
                                <li key={item.product_id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg text-black font-semibold">{item.product_name}</h2>
                                        <p className="text-sm text-black">Cantidad: {item.quantity}</p>
                                    </div>
                                    <p className="text-lg font-medium text-gray-800">
                                        ${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="ml-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-black xl font-bold text-right">Total: ${totalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}