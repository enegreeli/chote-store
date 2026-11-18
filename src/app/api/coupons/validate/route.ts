import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Informe o código do cupom' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Este cupom não está mais ativo' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Este cupom já expirou' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'O limite de uso deste cupom foi atingido' }, { status: 400 });
    }

    if (coupon.minPurchaseValue > 0 && subtotal < coupon.minPurchaseValue) {
      return NextResponse.json(
        { error: `Este cupom é válido apenas para compras acima de R$ ${coupon.minPurchaseValue.toFixed(2)}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseValue: coupon.minPurchaseValue,
      },
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 });
  }
}

