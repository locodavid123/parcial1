import { ObjectId } from 'mongodb';
import getDb from '@/app/config/mongo';

const COLLECTION = 'usuarios';

export async function collection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function findAll(query = {}) {
  const col = await collection();
  // Se pasa el filtro directamente a la consulta de la base de datos.
  return col.find(query).toArray();
}

export async function findById(id) {
  try {
    const _id = new ObjectId(id);
    const col = await collection();
    return col.findOne({ _id });
  } catch (e) {
    return null;
  }
}

export async function create(payload, options) {
  const col = await collection();
  const now = new Date();
  const doc = { ...payload, createdAt: now, updatedAt: now };
  const res = await col.insertOne(doc, options);
  return { _id: res.insertedId, ...doc };
}

export async function updateById(id, payload) {
  const col = await collection();
  try {
    const _id = new ObjectId(id);
    const now = new Date();
    const res = await col.findOneAndUpdate(
      { _id },
      { $set: { ...payload, updatedAt: now } },
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

export async function findByEmail(email) {
  if (!email) return null;
  const col = await collection();
  // Buscar correo de forma insensible a mayúsculas y sin espacios alrededor
  const clean = String(email).trim();
  // Escapar caracteres especiales para usar en regex
  const esc = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return col.findOne({ correo: { $regex: `^${esc}$`, $options: 'i' } });
}

export default {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
  findByEmail,
  collection, // Asegúrate de que esta línea esté presente
};
