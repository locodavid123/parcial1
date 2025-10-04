// Shim temporal para compatibilidad con código existente que importa '@/app/config/db'
// Antes este proyecto usaba Postgres y exportaba un `pool` con método `query()`.
// Actualmente la base de datos principal se ha migrado a MongoDB Atlas.
//
// Este archivo evita el error "Module not found" al ejecutar Next.js y proporciona
// un mensaje instructivo en tiempo de ejecución para que migrues o restaures la conexión.

function errorQuery() {
  throw new Error(
    'La configuración de Postgres (`src/app/config/db.js`) no está disponible.\n' +
    'Si quieres usar Postgres, recrea `src/app/config/db.js` con un Pool de `pg` y las credenciales.\n' +
    'Si has migrado a MongoDB Atlas, actualiza las rutas que importan `@/app/config/db` para usar el helper de Mongo en `src/app/config/mongo.js`\n' +
    'o usa los modelos en `src/models` que ya existen en el proyecto.'
  );
}

const pool = {
  // Interfaz mínima usada por el código restante: pool.query(sql, params)
  query: async function () {
    return errorQuery();
  }
};

export default pool;
