"use client";

import { useCart } from "@/context/CartContext";

// Datos de ejemplo basados en tu archivo backup.sql
const products = [
    { product_id: 1, product_name: "picadita", unit_price: "14000", imageUrl: "https://donjediondo.com/wp-content/uploads/2024/10/6.-Chunchullo-Papa-Criolla.png" },
    { product_id: 2, product_name: "chunchulla con criolla", unit_price: "13000", imageUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JCRSL37AIBBPHMQMIS2UDEXTU4.jpg" },
    { product_id: 3, product_name: "chunchulla con papa salada", unit_price: "13000", imageUrl: "https://www.infobae.com/new-resizer/GRl9BkLHuT_QezjZMgiOb_F9Hh4=/arc-anglerfish-arc2-prod-infobae/public/WHV4EYCYRBH6LGHQLR6PKCBF44.jpg" },
    { product_id: 4, product_name: "chunchulla con chirizo", unit_price: "13000", imageUrl: "https://files.alerta.rcnradio.com/alerta_bogota/public/2024-04/chunchullo.jpg?VyF_xxZ4QmA7JPiR8jn6Qop7yucOybs_" },
    { product_id: 6, product_name: "meros tacos x3", unit_price: "18000", imageUrl: "https://danosseasoning.com/wp-content/uploads/2022/03/Beef-Tacos-1024x767.jpg" },
    { product_id: 7, product_name: "platano gratinado", unit_price: "20000", imageUrl: "https://i.ytimg.com/vi/5xI7V11eTyc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDJwVWBunh9AHzuldE25Mu7rVh6qg" },
];

import { useState } from "react";

export default function Body() {
    const { addToCart } = useCart();
    const [quantities, setQuantities] = useState({});

    const handleQuantityChange = (productId, value) => {
        const qty = Math.max(1, parseInt(value) || 1);
        setQuantities((prev) => ({ ...prev, [productId]: qty }));
    };

    const handleAddToCart = (product) => {
        const quantity = quantities[product.product_id] || 1;
        addToCart({ ...product, quantity });
    };

    return (
        <main className="bg-gray-100 container mx-auto p-4 ">
            <h2 className="text-black text-3xl font-bold text-center my-8">Nuestros Productos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.product_id} className="border rounded-lg p-4 shadow-lg flex flex-col">
                        <img src={product.imageUrl} alt={product.product_name} className="w-full h-40 object-cover mb-4 rounded" />
                        <div className="flex-grow">
                            <h3 className="text-black text-lg xl font-semibold">{product.product_name}</h3>
                            <p className="text-gray-600 mt-2">${parseFloat(product.unit_price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center mt-4">
                            <label className=" text-black mr-2 font-medium">Unidades:</label>
                            <input
                                type="number"
                                min={1}
                                value={quantities[product.product_id] || 1}
                                onChange={(e) => handleQuantityChange(product.product_id, e.target.value)}
                                className="text-black w-17 p-1 border rounded text-center hover:bg-gray-200 hover:scale-105 transition duration-200 "
                            />
                        </div>
                        <button
                            onClick={() => handleAddToCart(product)}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );
}