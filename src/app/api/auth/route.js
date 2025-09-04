import pool from "@/app/config/db";

export async function GET(request) {
    try {
        const res = await pool.query("SELECT * FROM usuarios");
        return  Response.json(res.rows);
    } catch (error) {
        console.log(error);
        return new Response("Error al obtener los usuarios", { status: 500 });
    }
}

