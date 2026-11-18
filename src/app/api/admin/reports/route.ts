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
    const type = searchParams.get('type') || 'stock'; // stock, best-sellers, idle-products, sales, profit-by-product, expenses, movements, customers

    if (type === 'stock') {
      const sizes = await prisma.productSizeStock.findMany({
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
      });

      const data = sizes.map((s) => ({
        sku: s.product.sku,
        produto: s.product.name,
        categoria: s.product.category.name,
        tamanho: s.size,
        estoqueAtual: s.stock,
        estoqueMinimo: s.minStock,
        statusEstoque: s.stock === 0 ? 'Esgotado' : s.stock <= s.minStock ? 'Estoque Baixo' : 'Normal',
        custoUnitario: s.product.acquisitionCost,
        precoVenda: s.product.price,
        valorTotalEmEstoque: s.stock * s.product.acquisitionCost,
      }));

      return NextResponse.json({ success: true, title: 'Relatório de Estoque Atual por Tamanho', data });
    }

    if (type === 'best-sellers') {
      const items = await prisma.orderItem.findMany({
        where: { order: { status: { not: 'CANCELADO' } } },
        include: { product: true },
      });

      const map: Record<string, { nome: string; time: string; quantidade: number; receitaTotal: number; custoTotal: number; lucroTotal: number }> = {};
      items.forEach((item: any) => {
        if (!map[item.productName]) {
          map[item.productName] = {
            nome: item.productName,
            time: item.product?.team || item.product?.brand || 'Grife',
            quantidade: 0,
            receitaTotal: 0,
            custoTotal: 0,
            lucroTotal: 0,
          };
        }
        map[item.productName].quantidade += item.quantity;
        map[item.productName].receitaTotal += item.totalPrice;
        map[item.productName].custoTotal += item.costPrice * item.quantity;
        map[item.productName].lucroTotal += (item.totalPrice - item.costPrice * item.quantity);
      });

      const data = Object.values(map).sort((a, b) => b.quantidade - a.quantidade);
      return NextResponse.json({ success: true, title: 'Relatório de Produtos Mais Vendidos', data });
    }

    if (type === 'idle-products') {
      // Products with stock but zero sales in the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSales = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: thirtyDaysAgo } } },
        select: { productId: true },
      });
      const soldProductIds = new Set(recentSales.map((s: any) => s.productId));

      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { sizes: true, category: true },
      });

      const idle = products.filter((p: any) => !soldProductIds.has(p.id));
      const data = idle.map((p: any) => {
        const totalStock = (p.sizes || []).reduce((acc: number, s: any) => acc + s.stock, 0);
        return {
          sku: p.sku,
          produto: p.name,
          categoria: p.category?.name,
          marcaOuTime: p.brand || p.team || 'Grife',
          estoqueParado: totalStock,
          capitalImobilizado: totalStock * p.acquisitionCost,
          precoVenda: p.price,
        };
      });

      return NextResponse.json({ success: true, title: 'Relatório de Produtos Sem Giro (30 dias)', data });
    }

    if (type === 'profit-by-product') {
      const items = await prisma.orderItem.findMany({
        where: { order: { status: { not: 'CANCELADO' } } },
      });

      const map: Record<string, { produto: string; unidadesVendidas: number; faturamento: number; custoMercadoria: number; lucroBruto: number; margemLucro: string }> = {};
      items.forEach((it: any) => {
        if (!map[it.productName]) {
          map[it.productName] = {
            produto: it.productName,
            unidadesVendidas: 0,
            faturamento: 0,
            custoMercadoria: 0,
            lucroBruto: 0,
            margemLucro: '0%',
          };
        }
        map[it.productName].unidadesVendidas += it.quantity;
        map[it.productName].faturamento += it.totalPrice;
        map[it.productName].custoMercadoria += it.costPrice * it.quantity;
        map[it.productName].lucroBruto += it.totalPrice - it.costPrice * it.quantity;
      });

      const data = Object.values(map).map((p: any) => ({
        ...p,
        margemLucro: p.faturamento > 0 ? `${((p.lucroBruto / p.faturamento) * 100).toFixed(1)}%` : '0%',
      })).sort((a: any, b: any) => b.lucroBruto - a.lucroBruto);

      return NextResponse.json({ success: true, title: 'Relatório de Lucro Real por Produto', data });
    }

    if (type === 'expenses') {
      const expenses = await prisma.financialTransaction.findMany({
        where: { type: 'DESPESA' },
        orderBy: { date: 'desc' },
      });

      const data = expenses.map((e: any) => ({
        categoria: e.category,
        descricao: e.description,
        valor: e.amount,
        fornecedor: e.supplier || '-',
        formaPagamento: e.paymentMethod || '-',
        status: e.status,
        data: e.date,
      }));

      return NextResponse.json({ success: true, title: 'Relatório de Despesas Operacionais e Compras', data });
    }

    if (type === 'movements') {
      const movements = await prisma.stockMovement.findMany({
        take: 200,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      });

      const data = movements.map((m: any) => ({
        data: m.createdAt,
        sku: m.product?.sku,
        produto: m.product?.name,
        tamanho: m.size,
        tipo: m.type,
        quantidade: m.quantity,
        estoqueAnterior: m.previousStock,
        estoqueNovo: m.newStock,
        motivo: m.reason || '-',
        responsavel: m.createdBy?.name || 'Sistema',
      }));

      return NextResponse.json({ success: true, title: 'Relatório de Movimentações de Estoque', data });
    }

    if (type === 'customers') {
      const customers = await prisma.user.findMany({
        where: { role: 'CLIENTE' },
        include: {
          orders: {
            where: { status: { not: 'CANCELADO' } },
          },
        },
      });

      const data = customers.map((c: any) => ({
        nome: c.name,
        email: c.email,
        telefone: c.phone || '-',
        cpf: c.cpf || '-',
        totalPedidos: (c.orders || []).length,
        totalGasto: (c.orders || []).reduce((acc: number, o: any) => acc + o.total, 0),
        dataCadastro: c.createdAt,
      })).sort((a: any, b: any) => b.totalGasto - a.totalGasto);

      return NextResponse.json({ success: true, title: 'Relatório de Clientes e Faturamento', data });
    }

    return NextResponse.json({ error: 'Tipo de relatório não especificado' }, { status: 400 });
  } catch (error: any) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}
