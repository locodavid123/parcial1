"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useRouter } from "next/navigation";

export default function Body() {
    const router = useRouter();
    const { cartItems, addToCart } = useCart();
    const { products, loading, error } = useProducts();
    const [quantities, setQuantities] = useState({});
    const [pedidoError, setPedidoError] = useState('');
    const [pedidoSuccess, setPedidoSuccess] = useState('');

    const handleQuantityChange = (productId, value) => {
        const qty = Math.max(1, parseInt(value) || 1);
        setQuantities((prev) => ({ ...prev, [productId]: qty }));
    };

    const handleAddToCart = (product) => {
        const quantity = quantities[product.id] || 1;
        addToCart({ ...product, quantity });
        setPedidoSuccess('Producto agregado al carrito');
        setPedidoError('');
        setTimeout(() => setPedidoSuccess(''), 2000);
    };

    const handleRealizarPedido = () => {
        if (cartItems.length === 0) {
            setPedidoError('El carrito está vacío. Agrega productos antes de continuar.');
            setPedidoSuccess('');
            return;
        }
        router.push('/cart');
    };

    return (
    <main className="bg-gradient-to-br from-yellow-50 via-red-50 to-gray-100 min-h-screen container mx-auto p-8 my-10">
            {loading && <p className="text-center">Cargando productos...</p>}
            {error && <p className="text-center text-red-500">Error al cargar productos.</p>}
            <h2 className="text-black text-3xl font-bold text-center my-8">Nuestros Productos</h2>
            {pedidoError && <p className="text-center text-red-500 font-semibold mb-4">{pedidoError}</p>}
            {pedidoSuccess && <p className="text-center text-green-500 font-semibold mb-4">{pedidoSuccess}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-xl flex flex-col hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                        <img src={product.imageUrl} alt={product.nombre} className="w-full h-48 object-cover mb-4 rounded-xl border-2 border-yellow-300" />
                        <p className="text-xs text-gray-400 break-all">{product.imageUrl}</p>
                        <div className="flex-grow">
                            <h3 className="text-black text-lg xl font-semibold">{product.nombre}</h3>
                            <p className="text-gray-600 mt-2">{product.descripcion}</p>
                            <p className="text-gray-800 font-bold mt-2">${parseFloat(product.precio).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center mt-4">
                            <label className=" text-black mr-2 font-medium">Unidades:</label>
                            <input
                                type="number"
                                min={1}
                                value={quantities[product.id] || 1}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                className="text-black w-17 p-1 border rounded text-center hover:bg-gray-200 hover:scale-105 transition duration-200 "
                            />
                        </div>
                        <button
                            onClick={() => handleAddToCart(product)}
                            className="mt-6 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:from-yellow-500 hover:via-red-500 hover:to-pink-500 transition-all duration-200"
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                ))}
            </div>
            {/* Botón para ir al carrito */}
            <div className="flex justify-center mt-10">
                <button
                    onClick={handleRealizarPedido}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200"
                >
                    Hacer Pedido
                </button>
            </div>
        </main>
    );
}