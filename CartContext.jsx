
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Agregar producto al carrito
    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product_id === product.product_id);
            if (existingItem) {
                // Si el producto ya existe, actualizamos su cantidad
                return prevItems.map(item =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Si es nuevo, lo agregamos
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    // Eliminar producto del carrito
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
    };

    const value = { cartItems, addToCart, removeFromCart };
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Hook para usar el contexto fácilmente
export function useCart() {
    return useContext(CartContext);
}

