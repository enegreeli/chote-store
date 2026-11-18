import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const team = searchParams.get('team');
    const country = searchParams.get('country');
    const season = searchParams.get('season');
    const modelType = searchParams.get('modelType');
    const size = searchParams.get('size');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isBestSeller = searchParams.get('bestSeller') === 'true';
    const isNewRelease = searchParams.get('newRelease') === 'true';
    const isPromo = searchParams.get('promo') === 'true';
    const q = searchParams.get('q')?.trim();
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {
      isActive: true,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brand) {
      where.brand = { contains: brand };
    }

    if (team) {
      where.team = { contains: team };
    }

    if (country) {
      where.country = { contains: country };
    }

    if (season) {
      where.season = season;
    }

    if (modelType) {
      where.modelType = modelType;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isBestSeller) {
      where.isBestSeller = true;
    }

    if (isNewRelease) {
      where.isNewRelease = true;
    }

    if (isPromo) {
      where.isPromo = true;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { team: { contains: q } },
        { description: { contains: q } },
        { country: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size) {
      where.sizes = {
        some: {
          size: size,
          stock: { gt: 0 },
        },
      };
    }

    if (availableOnly) {
      where.sizes = {
        some: {
          stock: { gt: 0 },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name-asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'best-sellers') {
      orderBy = { isBestSeller: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        sizes: { orderBy: { size: 'asc' } },
      },
    });

    // Compute total available stock across all sizes for convenience
    const formatted = products.map((p: any) => {
      const totalStock = (p.sizes || []).reduce((acc: number, s: any) => acc + (s.stock || 0), 0);
      return {
        ...p,
        totalStock,
        isOutOfStock: totalStock <= 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formatted.length,
        products: formatted,
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
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Erro ao listar produtos' }, { status: 500 });
  }
}
