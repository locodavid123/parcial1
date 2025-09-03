
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
    };

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

