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
        const res = await fetch("/superUser/gestion/api");
        if (!res.ok) throw new Error("Error al cargar usuarios");
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