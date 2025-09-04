import { useState, useEffect, useCallback } from 'react';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al cargar los productos');
            }
            const data = await res.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, fetchProducts };
}
