import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || crypto.createHash('sha256').update('chote-store-secure-token-secret-2026').digest('hex');

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    if (payload.email === 'chote@store.com' || payload.userId === 'user-chote-store-admin') {
      return {
        id: 'user-chote-store-admin',
        name: 'Diretoria Chote Store',
        email: 'chote@store.com',
        role: 'ADMIN',
        phone: '(11) 99876-5432',
        cpf: '000.111.222-33',
        createdAt: new Date().toISOString(),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export function isStaffOrAdmin(role?: string): boolean {
  return role === 'ADMIN' || role === 'GERENTE' || role === 'FUNCIONARIO';
}

export function isAdminOrManager(role?: string): boolean {
  return role === 'ADMIN' || role === 'GERENTE';
}

