import { NextResponse } from 'next/server';
import * as User from '@/models/User';

export async function GET(request) {
    try {
        const users = await User.findAll();
        return NextResponse.json(users || []);
    } catch (error) {
        console.log(error);
        return new Response("Error al obtener los usuarios", { status: 500 });
    }
}

