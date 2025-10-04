import { MongoClient } from 'mongodb';

// Helper de conexión para MongoDB Atlas.
// Nota: no lanzamos un error en el tiempo de import para evitar que Next.js
// falle al iniciar si la variable de entorno falta; en su lugar validamos
// cuando alguien pide la conexión (getClient/getDb) y mostramos un mensaje
// descriptivo.

const globalAny = globalThis;
if (!globalAny._mongo) {
    globalAny._mongo = { client: null, promise: null };
}

async function _createClientPromise(uri) {
    const client = new MongoClient(uri, {
        // Opciones por defecto; ajusta si necesitas comportamiento personalizado
    });
    const p = client.connect().then((connectedClient) => {
        globalAny._mongo.client = connectedClient;
        return connectedClient;
    });
    globalAny._mongo.promise = p;
    return p;
}

export async function getClient() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error(
            'Define la variable de entorno MONGODB_URI en .env.local antes de usar la base de datos.\n' +
            'Ejemplo: MONGODB_URI="mongodb+srv://USER:PASS@cluster0.mongodb.net/?retryWrites=true&w=majority"'
        );
    }

    if (globalAny._mongo.promise) return globalAny._mongo.promise;
    return await _createClientPromise(uri);
}

export async function getDb() {
    const client = await getClient();
    // Determinar el nombre de la BD: usar MONGODB_DB si está definido,
    // si no, intentar extraerlo de la URI.
    let dbName = process.env.MONGODB_DB;
    if (!dbName) {
        const uri = process.env.MONGODB_URI || '';
        const lastSegment = uri.split('/').pop() || '';
        dbName = lastSegment.includes('?') ? lastSegment.split('?')[0] : lastSegment;
    }
    // Si dbName está vacío, client.db(undefined) usa la BD por defecto de la URI
    return client.db(dbName || undefined);
}

export default getDb;
