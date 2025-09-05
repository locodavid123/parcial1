import { useState, useEffect } from 'react';

export function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/superUser/clientes/api');
            if (!res.ok) throw new Error('Error al obtener los clientes');
            const data = await res.json();
            setClients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return { clients, loading, error, fetchClients };
}
