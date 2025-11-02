import { NextResponse } from 'next/server';
import * as User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son requeridos.' }, { status: 400 });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json({ message: 'Usuario no registrado.' }, { status: 404 });
    }
    
    // Asegurarnos de que estamos usando el ID de CouchDB
    user.id = user._id;

    // Manejar dos casos:
    // 1) La contraseña en la BD ya está hasheada con bcrypt ($2a/$2b/...)
    // 2) La contraseña está en texto claro (migración retroactiva)
    const stored = user.contraseña || user.password || '';
    let match = false;
    const isBcrypt = typeof stored === 'string' && /^\$2[aby]\$/.test(stored);
    if (isBcrypt) {
      match = await bcrypt.compare(String(password), String(stored));
    } else {
      // Texto plano: comparar directamente
      match = String(stored) === String(password);
      if (match) {
        // Migrar: hashear la contraseña y actualizar el documento para seguridad
        try {
          const newHash = await bcrypt.hash(String(password), 10);
          // user._id puede ser ObjectId; updateById acepta id string u ObjectId
          await User.updateById(String(user._id || user.id), { contraseña: newHash });
          console.info(`Usuario ${user.correo} migrado a contraseña hasheada.`);
        } catch (err) {
          console.error('Error al migrar contraseña del usuario:', err);
        }
      }
    }
    if (!match) {
      return NextResponse.json({ message: 'Contraseña incorrecta.' }, { status: 401 });
    }

    // No devolver la contraseña al cliente
    const { contraseña, password: pwd, ...safeUser } = user;
    // Normalizar id para cliente (opcional)
    safeUser.id = String(safeUser._id || safeUser.id || '');

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}
