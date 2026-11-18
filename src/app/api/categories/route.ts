import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 });
  }
}

