import { ObjectId, Double, Int32 } from 'mongodb'; // Importar Double e Int32
import getDb, { getClient } from '@/app/config/mongo';

const COLLECTION = 'productos';

async function collection() {
    const db = await getDb();
    return db.collection(COLLECTION);
}

// Helper para validar URLs
function isValidHttpUrl(s) {
    if (!s) return false;
    try {
        return /^https?:\/\/.+/.test(s);
    } catch (e) {
        return false;
    }
}

// Helper para parsear números, aceptando formatos locales
function parseLocaleNumber(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return value;
    const s = String(value).trim();
    if (s === '') return NaN;
    // "19.900,00" -> 19900.00
    if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
        return Number(s.replace(/\./g, '').replace(/,/g, '.'));
    }
    // "19900,50" -> 19900.50
    if (s.indexOf(',') !== -1) {
        return Number(s.replace(/,/g, '.'));
    }
    // "19,900.50" -> 19900.50
    return Number(s.replace(/,/g, ''));
}

/**
 * Devuelve todos los productos de la colección, ordenados por fecha de creación.
 * @returns {Promise<Array>}
 */
export async function findAll() {
    const col = await collection();
    return col.find({}).sort({ createdAt: 1 }).toArray();
}

export async function findById(id) {
    if (!id) return null;
    const col = await collection();
    try {
        const _id = new ObjectId(id);
        return col.findOne({ _id });
    } catch (e) {
        // id no es un ObjectId válido
        return null;
    }
}

/**
 * Sanea y valida un payload de producto antes de insertarlo o actualizarlo.
 * @param {object} payload - Los datos del producto.
 * @returns {Promise<object>} El payload saneado y listo para la BD.
 */
async function sanitize(payload) {
    const docPayload = {};

    if (payload.nombre !== undefined) docPayload.nombre = String(payload.nombre).trim();
    if (payload.descripcion !== undefined) docPayload.descripcion = String(payload.descripcion).trim();

    if (payload.precio !== undefined) {
        const num = parseLocaleNumber(payload.precio);
        if (!Number.isFinite(num)) {
            const e = new Error('El campo "precio" debe ser un número válido');
            e.status = 400;
            throw e;
        }
        // Forzar el tipo Double para cumplir con el validador de Atlas
        docPayload.precio = new Double(num);
    }

    if (payload.stock !== undefined) {
        const num = parseLocaleNumber(payload.stock);
        if (!Number.isFinite(num) || !Number.isInteger(num)) {
            const e = new Error('El campo "stock" debe ser un número entero válido');
            e.status = 400;
            throw e;
        }
        // Forzar el tipo Int32
        docPayload.stock = new Int32(num);
    }

    // Aceptar 'imageUrl' o 'imagenUrl' y normalizar a ambos campos
    const imageUrl = payload.imageUrl || payload.imagenUrl;
    if (imageUrl !== undefined) {
        const v = String(imageUrl).trim();
        if (!isValidHttpUrl(v)) {
            const e = new Error('El campo "imagenUrl" debe ser una URL válida (http/https)');
            e.status = 400;
            throw e;
        }
        docPayload.imageUrl = v;
        docPayload.imagenUrl = v; // Requerido por el validador de Atlas
    } else {
        // Asegurar que imagenUrl esté presente si es requerido por el esquema
        docPayload.imagenUrl = '';
    }

    return docPayload;
}

export async function create(payload, options = {}) {
    const col = await collection();
    const now = new Date();

    // Sanear el payload antes de la inserción
    const docPayload = await sanitize(payload);

    const doc = {
        ...docPayload,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const res = await col.insertOne(doc, options);
        return { _id: res.insertedId, ...doc };
    } catch (err) {
        // Propagar errores de validación para que la ruta los maneje
        if (err && err.code === 121 && err.errInfo) {
            const e = new Error('MongoDB Document validation failed');
            e.errInfo = err.errInfo;
            e.code = err.code;
            throw e;
        }
        throw err; // Re-lanzar otros errores
    }
}

export async function updateById(id, payload) {
    const col = await collection();
    const docPayload = await sanitize(payload);

    try {
        const _id = new ObjectId(id);
        const now = new Date();
        const res = await col.findOneAndUpdate(
            { _id },
            { $set: { ...docPayload, updatedAt: now } },
            { returnDocument: 'after' }
        );
        return res.value;
    } catch (e) {
        return null;
    }
}

export async function deleteById(id) {
    const col = await collection();
    try {
        const _id = new ObjectId(id);
        const res = await col.findOneAndDelete({ _id });
        return res.value;
    } catch (e) {
        return null;
    }
}

export default { findAll, findById, create, updateById, deleteById };
