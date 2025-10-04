/**
 * Script rápido para buscar un usuario por correo en la colección `usuarios`.
 * Uso:
 *  - copia tu URI a .env.local (MONGODB_URI)
 *  - node scripts/find-user.js correo@example.com
 */
import dotenv from 'dotenv';
import getDb from '../src/app/config/mongo.js';

// Cargar variables de entorno: preferir .env.local si existe, si no caer
// al comportamiento por defecto de dotenv.
try {
  dotenv.config({ path: '.env.local' });
} catch (e) {
  dotenv.config();
}

const [,, email] = process.argv;
if (!email) {
  console.error('Uso: node scripts/find-user.js correo@example.com');
  process.exit(1);
}

function escapeRegex(s) {
  return String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  try {
    const db = await getDb();
    console.log('Conectando a la base de datos:', db.databaseName || '[por defecto de la URI]');
    const col = db.collection('usuarios');
    const esc = escapeRegex(email);
    const user = await col.findOne({ correo: { $regex: `^${esc}$`, $options: 'i' } });
    if (!user) {
      console.log('Usuario no encontrado (búsqueda insensible a mayúsculas).');
      const exact = await col.findOne({ correo: email });
      if (exact) {
        console.log('Usuario encontrado con búsqueda exacta (diferencias de mayúsculas/espacios):');
        console.log(JSON.stringify(exact, null, 2));
      }
    } else {
      console.log('Usuario encontrado:');
      console.log(JSON.stringify(user, null, 2));
    }
  } catch (err) {
    console.error('Error al conectar a la BD:', err.message || err);
  } finally {
    process.exit(0);
  }
}

main();
