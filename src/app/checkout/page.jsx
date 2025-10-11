'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            router.push('/login');
        } else {
            setUser(JSON.parse(loggedInUser));
        }
    }, [router]);

    // CORRECCIÓN: Asegurarse de que item.precio sea un número antes de multiplicar.
    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.precio) * item.quantity), 0);

    const handleConfirmOrder = async () => {
        if (!user || cartItems.length === 0) return;

        setIsProcessing(true);
        setError('');

        const orderData = {
            cliente_id: user.id, // ID del usuario logueado
            cliente_info: { // Información del cliente para la colección 'clientes'
                nombre: user.nombre,
                correo: user.correo,
                telefono: user.telefono || '0000000000', // Asegurarse de que el teléfono exista
            },
            productos: cartItems.map(item => ({
                // CORRECCIÓN: Usar item._id si existe, de lo contrario usar item.id. Esto soluciona el error de ID undefined.
                producto_id: item._id || item.id,
                cantidad: item.quantity,
            })),
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'No se pudo procesar el pedido.');
            }

            alert('¡Pedido realizado con éxito!');
            clearCart();
            router.push('/clientes'); // Redirigir al panel del cliente

        } catch (err) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <>
            <Headers />
            <main className="container mx-auto px-4 py-8 min-h-screen">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>
                {cartItems.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Resumen del Pedido</h2>
                        <ul className="divide-y divide-gray-200 mb-6">
                            {cartItems.map(item => (
                                // CORRECCIÓN: Usar una key única y robusta para evitar el warning de React.
                                <li key={item._id || item.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.nombre}</p>
                                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                    </div>
                                    {/* CORRECCIÓN: Asegurarse de que item.precio sea un número para el cálculo. */}
                                    <p className="font-semibold">${(parseFloat(item.precio) * item.quantity).toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="text-right text-2xl font-bold mb-6">
                            Total: ${total.toFixed(2)}
                        </div>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <div className="text-right">
                            <button
                                onClick={handleConfirmOrder}
                                disabled={isProcessing}
                                className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Tu carrito está vacío.</p>
                )}
            </main>
            <Footer />
        </>
    );
}
