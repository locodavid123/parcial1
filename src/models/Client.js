import getDatabase from '@/app/config/couchdb.js';

export async function findAll() {
    try {
        const db = await getDatabase();
        const response = await db.clients.list({ include_docs: true });
        const docs = response.rows.map(row => row.doc);
        
        // Ordenar por createdAt
        return docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (error) {
        console.error('Error en findAll:', error);
        return [];
    }
}

export async function findById(id) {
    try {
        const db = await getDatabase();
        return await db.clients.get(id);
    } catch (error) {
        if (error.statusCode === 404) {
            return null;
        }
        console.error('Error en findById:', error);
        throw error;
    }
}

export async function create(payload, options = {}) {
    try {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const doc = { ...payload, createdAt: now, updatedAt: now };
        
        const response = await db.clients.insert(doc);
        return { ...doc, _id: response.id, _rev: response.rev };
    } catch (error) {
        console.error('Error en create:', error);
        throw error;
    }
}

export async function update(id, payload) {
    try {
        const db = await getDatabase();
        const existingDoc = await db.clients.get(id);
        
        const updatedDoc = {
            ...existingDoc,
            ...payload,
            _id: id,
            _rev: existingDoc._rev,
            updatedAt: new Date().toISOString()
        };
        
        const response = await db.clients.insert(updatedDoc);
        return { ...updatedDoc, _rev: response.rev };
    } catch (error) {
        console.error('Error en update:', error);
        throw error;
    }
}

export async function remove(id) {
    try {
        const db = await getDatabase();
        const doc = await db.clients.get(id);
        return await db.clients.destroy(id, doc._rev);
    } catch (error) {
        console.error('Error en remove:', error);
        throw error;
    }
}

export async function findByEmail(email) {
    try {
        const db = await getDatabase();
        const response = await db.clients.list({ include_docs: true });
        const clients = response.rows.map(row => row.doc);
        return clients.find(client => client.email === email) || null;
    } catch (error) {
        console.error('Error en findByEmail:', error);
        return null;
    }
}