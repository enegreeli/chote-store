import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Can be queried by ID or by orderNumber (e.g. #CT-1001 or URL encoded %23CT-1001)
    const decoded = decodeURIComponent(id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: decoded },
          { orderNumber: decoded },
          { orderNumber: `#${decoded}` },
        ],
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order detail fetch error:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso restrito à administração' }, { status: 403 });
    }

    const { id } = params;
    const { status, trackingCode, notes, reason } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const previousStatus = order.status;
    const isCancelling = status === 'CANCELADO' && previousStatus !== 'CANCELADO';

    const updated = await prisma.$transaction(async (tx) => {
      // 1. If cancelling, return items to inventory!
      if (isCancelling) {
        for (const item of (order.items || [])) {
          const sizeStock = await tx.productSizeStock.findFirst({
            where: { productId: item.productId, size: item.size },
          });

          if (sizeStock) {
            const previousStock = sizeStock.stock;
            const newStock = previousStock + item.quantity;

            await tx.productSizeStock.update({
              where: { id: sizeStock.id },
              data: { stock: { increment: item.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                sizeStockId: sizeStock.id,
                size: item.size,
                type: 'DEVOLUCAO',
                quantity: item.quantity,
                previousStock,
                newStock,
                reason: `Devolução ao estoque por cancelamento do pedido ${order.orderNumber}. Motivo: ${reason || 'Cancelado pelo administrador'}`,
                createdById: user.id,
              },
            });
          }
        }
      }

      // 2. Update Order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: status || order.status,
          trackingCode: trackingCode !== undefined ? trackingCode : order.trackingCode,
          notes: notes !== undefined ? notes : order.notes,
          paymentStatus: status === 'CANCELADO' ? 'REFUNDED' : status === 'PAGAMENTO_APROVADO' ? 'APPROVED' : order.paymentStatus,
          statusHistory: status && status !== previousStatus
            ? {
                create: {
                  status,
                  notes: notes || reason || `Status alterado por ${user.name} (${user.role})`,
                  changedBy: user.name,
                },
              }
            : undefined,
        },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

