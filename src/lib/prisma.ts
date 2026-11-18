import { storeDb } from './storeDb';

// Drop-in embedded database replacement for Prisma
// Uses embedded JSON database from data/store_db.json
export const prisma = storeDb;
export default prisma;
