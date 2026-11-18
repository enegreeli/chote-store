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
    const period = searchParams.get('period') || '30d'; // today, 7d, 30d, month, year

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let periodStart = new Date();
    if (period === 'today') {
      periodStart = startOfToday;
    } else if (period === '7d') {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      periodStart = startOfMonth;
    } else if (period === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1);
    }

    // Orders for indicators
    const allOrders = await prisma.order.findMany({
      include: { items: true },
    });

    const activeOrders = allOrders.filter((o) => o.status !== 'CANCELADO');

    // Revenue today
    const revenueToday = activeOrders
      .filter((o) => new Date(o.createdAt) >= startOfToday)
      .reduce((acc, o) => acc + o.total, 0);

    // Revenue this month
    const revenueMonth = activeOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((acc, o) => acc + o.total, 0);

    // Orders counts
    const pendingOrdersCount = allOrders.filter(
      (o) => o.status === 'AGUARDANDO_PAGAMENTO' || o.status === 'EM_PREPARACAO'
    ).length;

    const completedOrdersCount = allOrders.filter((o) => o.status === 'ENTREGUE').length;

    // Average Ticket
    const ticketMedio = activeOrders.length > 0
      ? activeOrders.reduce((acc, o) => acc + o.total, 0) / activeOrders.length
      : 0;

    // Estimated Profit Calculation (Actual revenue from items - actual cost of items)
    let totalEstimatedProfit = 0;
    activeOrders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const profit = item.totalPrice - item.costPrice * item.quantity;
        totalEstimatedProfit += profit;
      });
    });

    // Products and Stock metrics
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const allSizes = await prisma.productSizeStock.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, isActive: true } },
      },
    });

    const outOfStockItems = allSizes.filter((s: any) => s.product?.isActive && s.stock === 0);
    const lowStockItems = allSizes.filter(
      (s: any) => s.product?.isActive && s.stock > 0 && s.stock <= s.minStock
    );

    // Chart 1: Daily sales and revenue over the last 14 days
    const dailyMap: Record<string, { date: string; revenue: number; orders: number; profit: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dailyMap[key] = { date: key, revenue: 0, orders: 0, profit: 0 };
    }

    activeOrders.forEach((o: any) => {
      const key = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.total;
        dailyMap[key].orders += 1;
        (o.items || []).forEach((it: any) => {
          dailyMap[key].profit += it.totalPrice - it.costPrice * it.quantity;
        });
      }
    });

    const salesByDayChart = Object.values(dailyMap);

    // Chart 2: Top Selling Products
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    activeOrders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        if (!productSalesMap[item.productName]) {
          productSalesMap[item.productName] = {
            name: item.productName.length > 25 ? item.productName.substring(0, 25) + '...' : item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productName].quantity += item.quantity;
        productSalesMap[item.productName].revenue += item.totalPrice;
      });
    });

    const topProductsChart = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      kpis: {
        revenueToday,
        revenueMonth,
        totalSalesCount: activeOrders.length,
        pendingOrdersCount,
        completedOrdersCount,
        totalProducts,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        ticketMedio,
        totalEstimatedProfit,
      },
      charts: {
        salesByDayChart,
        topProductsChart,
      },
      lowStockList: lowStockItems.slice(0, 5).map((s: any) => ({
        id: s.id,
        productName: s.product?.name,
        sku: s.product?.sku,
        size: s.size,
        stock: s.stock,
        minStock: s.minStock,
      })),
      recentOrders,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 });
  }
}
