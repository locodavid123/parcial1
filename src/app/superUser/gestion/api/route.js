import pool from "@/app/config/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const client = await pool.connect();
    try {
        const { nombre, correo, contraseña, rol, telefono } = await request.json();

        // Validación básica de los datos
        if (!nombre || !correo || !contraseña || !rol) {
            return NextResponse.json(
                { message: "Todos los campos son obligatorios." },
                { status: 400 }
            );
        }

        await client.query('BEGIN');

        // En una aplicación real, aquí deberías hashear la contraseña antes de guardarla.
        // Ejemplo: const hashedPassword = await bcrypt.hash(contraseña, 10);

        const userRes = await client.query(
            "INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES ($1, $2, $3, $4) RETURNING *",
            [nombre, correo, contraseña, rol]
        );
        const newUser = userRes.rows[0];

        // Si el rol es 'cliente', insertar también en la tabla de clientes
        if (rol === 'cliente') {
            await client.query(
                "INSERT INTO clientes (nombre, correo, telefono, usuario_id) VALUES ($1, $2, $3, $4)",
                [nombre, correo, telefono || null, newUser.id]
            );
        }

        await client.query('COMMIT');

        return NextResponse.json(newUser, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        // Manejar error de correo duplicado
        if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return NextResponse.json({ message: "El correo electrónico ya está registrado." }, { status: 409 });
        }
        return NextResponse.json({ message: "Error al crear el usuario." }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request) {
    try {
        const { id, rol } = await request.json();

        if (!id || !rol) {
            return NextResponse.json(
                { message: "Se requiere el ID del usuario y el nuevo rol." },
                { status: 400 }
            );
        }

        const updatedUser = await pool.query(
            "UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING *",
            [rol, id]
        );

        if (updatedUser.rowCount === 0) {
            return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
        }

        return NextResponse.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al actualizar el usuario." }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: "Falta el ID del usuario." }, { status: 400 });
        }

        const deleteRes = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al eliminar el usuario." }, { status: 500 });
    }
}