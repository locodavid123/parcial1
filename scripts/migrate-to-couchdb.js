import { MongoClient } from 'mongodb';
import getDatabase from '../src/app/config/couchdb.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function migrateData() {
    // Conexión a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const mongoDbName = process.env.MONGODB_DB;
    
    if (!mongoUri || !mongoDbName) {
        console.error('Falta configuración de MongoDB');
        process.exit(1);
    }

    try {
        // Conectar a MongoDB
        const mongoClient = await MongoClient.connect(mongoUri);
        const mongoDB = mongoClient.db(mongoDbName);

        // Obtener instancia de CouchDB
        const couchDB = await getDatabase();

        // Migrar usuarios
        console.log('Migrando usuarios...');
        const users = await mongoDB.collection('users').find({}).toArray();
        for (const user of users) {
            try {
                await couchDB.users.insert({
                    ...user,
                    _id: user._id.toString()
                });
            } catch (error) {
                if (error.statusCode !== 409) { // Ignorar si el documento ya existe
                    console.error('Error migrando usuario:', error);
                }
            }
        }

        // Migrar productos
        console.log('Migrando productos...');
        const products = await mongoDB.collection('products').find({}).toArray();
        for (const product of products) {
            try {
                await couchDB.products.insert({
                    ...product,
                    _id: product._id.toString()
                });
            } catch (error) {
                if (error.statusCode !== 409) {
                    console.error('Error migrando producto:', error);
                }
            }
        }

        // Migrar clientes
        console.log('Migrando clientes...');
        const clients = await mongoDB.collection('clients').find({}).toArray();
        for (const client of clients) {
            try {
                await couchDB.clients.insert({
                    ...client,
                    _id: client._id.toString()
                });
            } catch (error) {
                if (error.statusCode !== 409) {
                    console.error('Error migrando cliente:', error);
                }
            }
        }

        // Migrar pedidos
        console.log('Migrando pedidos...');
        const orders = await mongoDB.collection('orders').find({}).toArray();
        for (const order of orders) {
            try {
                await couchDB.orders.insert({
                    ...order,
                    _id: order._id.toString()
                });
            } catch (error) {
                if (error.statusCode !== 409) {
                    console.error('Error migrando pedido:', error);
                }
            }
        }

        console.log('Migración completada exitosamente');
        await mongoClient.close();
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrateData();