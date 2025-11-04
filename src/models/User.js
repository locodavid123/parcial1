import getDatabase from '@/app/config/couchdb.js';

export async function findAll(query = {}) {
    const db = await getDatabase();
    try {
        // En CouchDB necesitamos crear una vista para consultas complejas
        // Por ahora, obtenemos todos los documentos y filtramos en memoria
        const response = await db.users.list({ include_docs: true });
        let docs = response.rows.map(row => row.doc);
        
        // Aplicar filtros si existen
        if (Object.keys(query).length > 0) {
            docs = docs.filter(doc => {
                return Object.entries(query).every(([key, value]) => doc[key] === value);
            });
        }
        
        return docs;
    } catch (error) {
        console.error('Error en findAll:', error);
        return [];
    }
}

export async function findById(id) {
    try {
        const db = await getDatabase();
        return await db.users.get(id);
    } catch (error) {
        if (error.statusCode === 404) {
            return null;
        }
        console.error('Error en findById:', error);
        throw error;
    }
}

export async function findByFaceDescriptor(faceDescriptor, email) {
    try {
        const db = await getDatabase();
        
        // Si se proporciona un email, buscar solo ese usuario. Si no, buscar en todos.
        let usersToSearch = [];
        if (email) {
            const user = await findByEmail(email);
            if (user) usersToSearch.push(user);
        } else {
            const response = await db.users.list({ include_docs: true });
            usersToSearch = response.rows.map(row => row.doc)
                .filter(user => user.faceDescriptors && user.faceDescriptors.length > 0);
        }

        // Convert incoming descriptor to numbers (in case it comes as strings)
        const target = Array.isArray(faceDescriptor) ? faceDescriptor.map(Number) : [];
        if (target.length === 0) return null;

        // Euclidean distance between two descriptors
        const distance = (a, b) => {
            let s = 0;
            for (let i = 0; i < a.length && i < b.length; i++) {
                const d = a[i] - b[i];
                s += d * d;
            }
            return Math.sqrt(s);
        };

        const THRESHOLD = 0.6; // valor típico para face-api.js

        for (const user of usersToSearch) {
            // Soportar tanto `faceDescriptors` (array) como `faceDescriptor` (único)
            const storedList = user.faceDescriptors || (user.faceDescriptor ? [user.faceDescriptor] : []);
            for (const stored of storedList) {
                const storedArr = Array.isArray(stored) ? stored.map(Number) : [];
                if (storedArr.length === 0) continue;
                const d = distance(target, storedArr);
                if (d <= THRESHOLD) {
                    return user; // coincidencia encontrada
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error en findByFaceDescriptor:', error);
        return null;
    }
}

export async function findByToken(query) {
    // NOTA: Esta implementación es para CouchDB. La query original era para MongoDB.
    // Para optimizar, se debería crear una vista por `passwordResetToken`.
    const db = await getDatabase();
    const response = await db.users.list({ include_docs: true });
    const user = response.rows
        .map(row => row.doc)
        .find(doc => 
            doc.passwordResetToken === query.passwordResetToken &&
            new Date(doc.passwordResetExpires) > new Date()
        );
    
    return user || null;
}

export async function findByEmail(email) {
    try {
        const db = await getDatabase();
        const response = await db.users.list({ include_docs: true });
        const users = response.rows.map(row => row.doc)
            .filter(user => user.correo === email);
        return users[0] || null;
    } catch (error) {
        console.error('Error en findByEmail:', error);
        return null;
    }
}

export async function create(userData) {
    try {
        const db = await getDatabase();
        const { id, ...data } = userData;
        const response = await db.users.insert(data);
        return { ...data, _id: response.id, _rev: response.rev };
    } catch (error) {
        console.error('Error en create:', error);
        throw error;
    }
}

export async function update(id, userData) {
    return updateUser(id, userData);
}

export async function updateById(id, userData) {
    try {
        const db = await getDatabase();
        const existingDoc = await db.users.get(id);
        const updatedDoc = { ...existingDoc, ...userData, _id: id, _rev: existingDoc._rev };
        const response = await db.users.insert(updatedDoc);
        return { ...updatedDoc, _rev: response.rev };
    } catch (error) {
        console.error('Error en updateById:', error);
        throw error;
    }
}

export async function updateUser(id, data) {
    // Reutiliza la lógica de CouchDB existente.
    return updateById(id, data);
}

export async function deleteById(id) {
    try {
        const db = await getDatabase();
        const user = await db.users.get(id);
        await db.users.destroy(id, user._rev);
        return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
        console.error('Error en deleteById:', error);
        throw error;
    }
}

export async function remove(id) {
    try {
        const db = await getDatabase();
        const doc = await db.users.get(id);
        return await db.users.destroy(id, doc._rev);
    } catch (error) {
        console.error('Error en remove:', error);
        throw error;
    }
}

export async function addFaceDescriptor(userId, descriptor) {
    try {
        const db = await getDatabase();
        const user = await db.users.get(userId);
        const faceDescriptors = user.faceDescriptors || [];
        faceDescriptors.push(descriptor);
        
        const updatedUser = { ...user, faceDescriptors };
        const response = await db.users.insert(updatedUser);
        return { ...updatedUser, _rev: response.rev };
    } catch (error) {
        console.error('Error en addFaceDescriptor:', error);
        throw error;
    }
}