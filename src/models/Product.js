import { ObjectId } from 'mongodb';
import getDb from '@/app/config/mongo';

const COLLECTION = 'productos';

async function collection() {
    const db = await getDb();
    return db.collection(COLLECTION);
}

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

export async function create(payload) {
  const col = await collection();
  const now = new Date();
  const doc = { ...payload, createdAt: now, updatedAt: now };
  const res = await col.insertOne(doc);
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

export default { findAll, findById, create, updateById, deleteById };
