'use client';

import { useState, useEffect, useCallback } from 'react';

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            // No se pasa cliente_id para obtener todos los pedidos
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('Error al cargar los pedidos');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, fetchOrders };
}