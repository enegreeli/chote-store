import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        sizes: { orderBy: { size: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Related products (same category or team, excluding current)
    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        isActive: true,
        OR: [
          { categoryId: product.categoryId },
          { team: product.team },
        ],
      },
      take: 4,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        sizes: true,
      },
    });

    const totalStock = (product.sizes || []).reduce((acc: number, s: any) => acc + (s.stock || 0), 0);

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          totalStock,
          isOutOfStock: totalStock <= 0,
        },
        related,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Product detail error:', error);
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

