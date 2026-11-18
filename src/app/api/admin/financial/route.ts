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
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year', 'all'

    const now = new Date();
    let startDate: Date | null = null;

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const where: any = {};
    if (startDate) {
      where.date = { gte: startDate };
    }

    // Transactions
    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Orders in period for Cost of Goods Sold (CMV) calculation
    const orderWhere: any = { status: { not: 'CANCELADO' } };
    if (startDate) {
      orderWhere.createdAt = { gte: startDate };
    }

    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: { items: true },
    });

    // Financial calculations
    let faturamentoBruto = 0;
    let cmvTotal = 0; // Custo das mercadorias vendidas

    orders.forEach((o: any) => {
      faturamentoBruto += o.total;
      (o.items || []).forEach((item: any) => {
        cmvTotal += item.costPrice * item.quantity;
      });
    });

    // Other receipts from transactions
    const outrasReceitas = transactions
      .filter((t: any) => t.type === 'RECEITA' && t.category !== 'VENDA' && t.status === 'PAGO')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const receitaTotal = faturamentoBruto + outrasReceitas;

    // Despesas operacionais (excluindo CMV que é calculado pelos itens)
    const despesasOperacionais = transactions
      .filter((t: any) => t.type === 'DESPESA' && t.category !== 'COMPRA_MERCADORIA' && t.status === 'PAGO')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const comprasEstoque = transactions
      .filter((t: any) => t.type === 'DESPESA' && t.category === 'COMPRA_MERCADORIA' && t.status === 'PAGO')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    // Contas a pagar e a receber
    const contasAPagar = transactions
      .filter((t: any) => t.type === 'DESPESA' && t.status === 'PENDENTE')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const contasAReceber = transactions
      .filter((t: any) => t.type === 'RECEITA' && t.status === 'PENDENTE')
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    // Lucro Bruto = Faturamento - CMV
    const lucroBruto = Math.max(0, faturamentoBruto - cmvTotal);

    // Lucro Líquido = Lucro Bruto - Despesas Operacionais
    const lucroLiquido = faturamentoBruto - cmvTotal - despesasOperacionais;

    // Margem de Lucro Líquido (%)
    const margemLiquida = faturamentoBruto > 0 ? (lucroLiquido / faturamentoBruto) * 100 : 0;
    const margemBruta = faturamentoBruto > 0 ? (lucroBruto / faturamentoBruto) * 100 : 0;

    return NextResponse.json({
      success: true,
      period,
      indicators: {
        faturamentoBruto,
        cmvTotal,
        despesasOperacionais,
        comprasEstoque,
        outrasReceitas,
        receitaTotal,
        lucroBruto,
        lucroLiquido,
        margemBruta,
        margemLiquida,
        contasAPagar,
        contasAReceber,
      },
      transactions,
    });
  } catch (error: any) {
    console.error('Financial fetch error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados financeiros' }, { status: 500 });
  }
}

// POST: Add new transaction (Despesa or Receita)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const {
      type, // RECEITA, DESPESA
      category, // COMPRA_MERCADORIA, FRETE, EMBALAGEM, TAXA_GATEWAY, DESPESA_OPERACIONAL, OUTRA_DESPESA, OUTRA_RECEITA
      description,
      amount,
      paymentMethod,
      supplier,
      dueDate,
      status, // PAGO, PENDENTE
    } = await req.json();

    if (!type || !description || !amount) {
      return NextResponse.json({ error: 'Tipo, descrição e valor são obrigatórios' }, { status: 400 });
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        type,
        category: category || (type === 'DESPESA' ? 'DESPESA_OPERACIONAL' : 'OUTRA_RECEITA'),
        description,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || null,
        supplier: supplier || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PAGO',
        paidAt: status === 'PAGO' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Financial create error:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar movimentação financeira' }, { status: 500 });
  }
}
