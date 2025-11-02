import nano from 'nano';

const url = process.env.COUCHDB_URL || 'http://localhost:5984';
const username = process.env.COUCHDB_USERNAME || 'Sebas1699';
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

        // --- INICIO: Crear vista de búsqueda para productos ---
        const productsDb = db.products;
        const designDocId = '_design/products';
        const designDoc = {
            _id: designDocId,
            views: {
                by_keyword: {
                    map: function (doc) {
                        if (doc.nombre) {
                            // Tokeniza y emite palabras del nombre y descripción
                            const text = `${doc.nombre} ${doc.descripcion || ''}`;
                            const words = text.toLowerCase().match(/\w+/g);
                            if (words) {
                                const uniqueWords = new Set(words);
                                uniqueWords.forEach(word => {
                                    emit(word, doc._id);
                                });
                            }
                        }
                    }.toString() // Convertimos la función a string para CouchDB
                }
            },
            language: 'javascript'
        };

        try {
            const existing = await productsDb.get(designDocId);
            designDoc._rev = existing._rev;
        } catch (err) {
            if (err.statusCode !== 404) throw err;
        }

        await productsDb.insert(designDoc);
        console.log('Vista de búsqueda de productos asegurada.');
        // --- FIN: Crear vista de búsqueda para productos ---

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