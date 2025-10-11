import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const options = {};

if (!uri) {
    throw new Error(
        'Define la variable de entorno MONGODB_URI en .env.local antes de usar la base de datos.\n' +
        'Ejemplo: MONGODB_URI="mongodb+srv://USER:PASS@cluster0.mongodb.net/?retryWrites=true&w=majority"'
    );
}
if (!dbName) {
    throw new Error(
        'Define la variable de entorno MONGODB_DB en .env.local con el nombre de tu base de datos.'
    );
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
    // En desarrollo, usamos una variable global para preservar el valor
    // a través de las recargas de módulos causadas por HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // En producción, es mejor no usar una variable global.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export async function getClient() {
    return clientPromise;
}

export async function getDb() {
    const client = await getClient();
    return client.db(dbName);
}

export default getDb;
