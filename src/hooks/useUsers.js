"use client";

import { useState, useEffect } from "react";

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener usuarios
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // SOLUCIÓN: Se elimina el filtro para que obtenga TODOS los usuarios.
            const res = await fetch("/superUser/gestion/api");
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al cargar los usuarios");
            }
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, fetchUsers };
}
