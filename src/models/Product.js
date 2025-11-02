import getDatabase from '@/app/config/couchdb.js';

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
    // "19,900.00" -> 19900.00
    if (s.indexOf(',') !== -1) {
        return Number(s.replace(/,/g, ''));
    }
    return Number(s);
}

export async function findAll(query = {}) {
    try {
        const db = await getDatabase();
        const response = await db.products.list({ include_docs: true });
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
        return await db.products.get(id);
    } catch (error) {
        if (error.statusCode === 404) {
            return null;
        }
        console.error('Error en findById:', error);
        throw error;
    }
}

export async function create(productData) {
    try {
        const db = await getDatabase();
        // Validación y normalización de datos
        const normalizedData = normalizeProductData(productData);
        const { id, ...data } = normalizedData;
        
        const response = await db.products.insert(data);
        return { ...data, _id: response.id, _rev: response.rev };
    } catch (error) {
        console.error('Error en create:', error);
        throw error;
    }
}

export async function update(id, productData) {
    return updateById(id, productData);
}

export async function updateById(id, productData) {
    try {
        const db = await getDatabase();
        const existingDoc = await db.products.get(id);
        const normalizedData = normalizeProductData(productData);
        
        const updatedDoc = { 
            ...existingDoc, 
            ...normalizedData, 
            _id: id, 
            _rev: existingDoc._rev 
        };
        
        const response = await db.products.insert(updatedDoc);
        return { ...updatedDoc, _rev: response.rev };
    } catch (error) {
        console.error('Error en updateById:', error);
        throw error;
    }
}

export async function deleteById(id) {
    try {
        const db = await getDatabase();
        const doc = await db.products.get(id);
        return await db.products.destroy(id, doc._rev);
    } catch (error) {
        console.error('Error en deleteById:', error);
        throw error;
    }
}

export async function remove(id) {
    try {
        const db = await getDatabase();
        const doc = await db.products.get(id);
        return await db.products.destroy(id, doc._rev);
    } catch (error) {
        console.error('Error en remove:', error);
        throw error;
    }
}

export async function updateStock(id, quantity) {
    try {
        const db = await getDatabase();
        const product = await db.products.get(id);
        
        const currentStock = parseFloat(product.stock) || 0;
        const newStock = currentStock + parseFloat(quantity);
        
        if (newStock < 0) {
            throw new Error('Stock insuficiente');
        }
        
        const updatedProduct = {
            ...product,
            stock: newStock,
            _id: id,
            _rev: product._rev
        };
        
        const response = await db.products.insert(updatedProduct);
        return { ...updatedProduct, _rev: response.rev };
    } catch (error) {
        console.error('Error en updateStock:', error);
        throw error;
    }
}

function normalizeProductData(data) {
    const normalized = { ...data };

    // Normalizar campos numéricos
    if ('price' in normalized) {
        normalized.price = parseLocaleNumber(normalized.price);
    }
    if ('stock' in normalized) {
        normalized.stock = parseLocaleNumber(normalized.stock);
    }
    if ('minStock' in normalized) {
        normalized.minStock = parseLocaleNumber(normalized.minStock);
    }

    // Validar y normalizar imageUrl
    if ('imageUrl' in normalized) {
        if (!isValidHttpUrl(normalized.imageUrl)) {
            delete normalized.imageUrl;
        }
    }

    // Asegurar que los campos requeridos existan
    normalized.name = normalized.name || '';
    normalized.description = normalized.description || '';
    normalized.price = normalized.price || 0;
    normalized.stock = normalized.stock || 0;
    normalized.minStock = normalized.minStock || 0;

    return normalized;
}

export async function search(query) {
    try {
        const db = await getDatabase();
        const response = await db.products.list({ include_docs: true });
        const products = response.rows.map(row => row.doc);
        
        // Implementar búsqueda en memoria
        const searchTerms = query.toLowerCase().split(' ');
        return products.filter(product => {
            const searchText = `${product.name} ${product.description}`.toLowerCase();
            return searchTerms.every(term => searchText.includes(term));
        });
    } catch (error) {
        console.error('Error en search:', error);
        return [];
    }
}