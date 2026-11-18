import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito a Administradores' }, { status: 403 });
    }

    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'GERENTE', 'FUNCIONARIO'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        cpf: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, users: staffUsers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito a Administradores' }, { status: 403 });
    }

    const { name, email, password, role, phone, cpf } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Nome, e-mail, senha e cargo são obrigatórios' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário cadastrado com este e-mail' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role, // ADMIN, GERENTE, FUNCIONARIO
        phone: phone || null,
        cpf: cpf || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        cpf: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar usuário' }, { status: 400 });
  }
}
