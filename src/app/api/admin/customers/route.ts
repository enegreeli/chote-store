import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: any = {
      role: 'CLIENTE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });

    const formatted = customers.map((c: any) => {
      const userOrders = Array.isArray(c.orders) ? c.orders : [];
      const activeOrders = userOrders.filter((o: any) => o.status !== 'CANCELADO');
      const totalSpent = activeOrders.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);
      const lastOrder = userOrders[0];

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        cpf: c.cpf,
        createdAt: c.createdAt,
        totalOrders: userOrders.length,
        totalSpent,
        lastPurchaseAt: lastOrder ? lastOrder.createdAt : null,
        addresses: c.addresses || [],
        orders: userOrders,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, customers: formatted });
  } catch (error: any) {
    console.error('Customers fetch error:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}
