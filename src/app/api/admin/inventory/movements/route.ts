import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (productId) {
      where.productId = productId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true, team: true } },
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, count: movements.length, movements });
  } catch (error: any) {
    console.error('Movements fetch error:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de movimentações' }, { status: 500 });
  }
}

