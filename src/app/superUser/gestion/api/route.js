import pool from "@/app/config/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { nombre, correo, contraseña, rol } = await request.json();

        // Validación básica de los datos
        if (!nombre || !correo || !contraseña || !rol) {
            return NextResponse.json(
                { message: "Todos los campos son obligatorios." },
                { status: 400 }
            );
        }

        // En una aplicación real, aquí deberías hashear la contraseña antes de guardarla.
        // Ejemplo: const hashedPassword = await bcrypt.hash(contraseña, 10);

        const newUser = await pool.query(
            "INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES ($1, $2, $3, $4) RETURNING *",
            [nombre, correo, contraseña, rol]
        );

        return NextResponse.json(newUser.rows[0], { status: 201 });

    } catch (error) {
        console.error(error);
        // Manejar error de correo duplicado
        if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return NextResponse.json({ message: "El correo electrónico ya está registrado." }, { status: 409 });
        }
        return NextResponse.json({ message: "Error al crear el usuario." }, { status: 500 });
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