import nano from 'nano';

const url = process.env.COUCHDB_URL || 'http://localhost:5984';
const username = process.env.COUCHDB_USERNAME || 'admin';
const password = process.env.COUCHDB_PASSWORD || '123456';

console.log('CouchDB Configuration:', {
    url,
    username,
    password: '****' // No mostramos la contraseña real por seguridad
});

if (!username || !password) {
    throw new Error(
        'Define las variables de entorno COUCHDB_USERNAME y COUCHDB_PASSWORD en .env.local'
    );
}

// Crear la conexión a CouchDB con autenticación
const connection = nano(`http://${username}:${password}@${url.replace('http://', '')}`);

// Bases de datos que usaremos
const databases = {
    users: 'users',
    products: 'products',
    clients: 'clients',
    orders: 'orders'
};

// Función para inicializar las bases de datos
async function initializeDatabases() {
    try {
        // Crear las bases de datos si no existen
        for (const dbName of Object.values(databases)) {
            try {
                await connection.db.create(dbName);
                console.log(`Base de datos ${dbName} creada`);
            } catch (error) {
                // Si el error es porque ya existe la base de datos, ignoramos el error
                if (error.statusCode !== 412) {
                    console.error(`Error creando base de datos ${dbName}:`, error);
                }
            }
        }

        // Crear las conexiones a cada base de datos
        const db = {
            users: connection.use(databases.users),
            products: connection.use(databases.products),
            clients: connection.use(databases.clients),
            orders: connection.use(databases.orders)
        };

        return db;
    } catch (error) {
        console.error('Error inicializando bases de datos:', error);
        throw error;
    }
}

// Singleton para mantener la conexión
let dbInstance = null;

export async function getDatabase() {
    if (!dbInstance) {
        dbInstance = await initializeDatabases();
    }
    return dbInstance;
}

export default getDatabase;