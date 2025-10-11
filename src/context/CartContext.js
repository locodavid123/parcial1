'use client';

import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === product._id);

            if (existingItem) {
                // Si el producto ya está en el carrito, actualiza la cantidad
                return prevItems.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Si es un producto nuevo, lo agrega al carrito
                // CORRECCIÓN CLAVE: Asegurarse de que el precio se guarde como número
                const numericPrice = typeof product.precio === 'number'
                    ? product.precio
                    : parseFloat(product.precio) || 0;

                return [...prevItems, { ...product, precio: numericPrice, quantity }];
            }
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};