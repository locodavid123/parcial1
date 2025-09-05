'use client';

import { useState, useEffect, useCallback } from 'react';

export function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            if (!res.ok) throw new Error('Error al cargar los clientes');
            const data = await res.json();
            setClients(data);
            setError(null); // Limpiar errores anteriores si la petición es exitosa
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return { clients, loading, error, fetchClients };
}