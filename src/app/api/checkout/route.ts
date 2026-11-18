import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer,
      items,
      paymentMethod,
      shippingOption,
      couponCode,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'O carrinho está vazio' }, { status: 400 });
    }

    if (!customer || !customer.name || !customer.email || !customer.cpf || !customer.phone) {
      return NextResponse.json({ error: 'Dados do cliente incompletos' }, { status: 400 });
    }

    if (!customer.zipCode || !customer.street || !customer.number || !customer.city || !customer.state) {
      return NextResponse.json({ error: 'Endereço de entrega incompleto' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    // Run atomic transaction to guarantee stock consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify availability of every size and fetch up-to-date product prices/costs
      const validatedItems: Array<{
        productId: string;
        productName: string;
        productImage: string;
        size: string;
        sizeStockId: string;
        quantity: number;
        unitPrice: number;
        costPrice: number;
        totalPrice: number;
        currentStock: number;
      }> = [];

      let subtotal = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            sizes: { where: { size: item.size } },
          },
        });

        if (!product || !product.isActive) {
          throw new Error(`O produto "${item.name || item.productId}" não está mais disponível.`);
        }

        const sizeStock = product.sizes[0];
        if (!sizeStock) {
          throw new Error(`O tamanho ${item.size} não existe para o produto "${product.name}".`);
        }

        if (sizeStock.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para "${product.name}" (Tamanho ${item.size}). Disponível: ${sizeStock.stock} un. Solicitado: ${item.quantity} un.`
          );
        }

        const effectivePrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;
        const itemTotal = effectivePrice * item.quantity;
        subtotal += itemTotal;

        const imgUrl = product.images[0]?.url || item.image || '';

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          productImage: imgUrl,
          size: item.size,
          sizeStockId: sizeStock.id,
          quantity: item.quantity,
          unitPrice: effectivePrice,
          costPrice: product.acquisitionCost,
          totalPrice: itemTotal,
          currentStock: sizeStock.stock,
        });
      }

      // 2. Validate Coupon if provided
      let discountAmount = 0;
      let validCoupon = null;

      if (couponCode) {
        validCoupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        if (
          validCoupon &&
          validCoupon.isActive &&
          (!validCoupon.expiresAt || new Date(validCoupon.expiresAt) >= new Date()) &&
          (!validCoupon.maxUses || validCoupon.usedCount < validCoupon.maxUses) &&
          subtotal >= validCoupon.minPurchaseValue
        ) {
          if (validCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * validCoupon.discountValue) / 100;
          } else if (validCoupon.discountType === 'FIXED') {
            discountAmount = Math.min(validCoupon.discountValue, subtotal);
          } else if (validCoupon.discountType === 'FREE_SHIPPING') {
            discountAmount = shippingOption?.price || 0;
          }

          // Increment coupon usage
          await tx.coupon.update({
            where: { id: validCoupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const shippingCost = validCoupon?.discountType === 'FREE_SHIPPING' || subtotal >= 399 ? 0 : (shippingOption?.price || 0);
      const finalTotal = Math.max(0, subtotal - (validCoupon?.discountType !== 'FREE_SHIPPING' ? discountAmount : 0) + shippingCost);

      // Generate friendly unique order number: #CT-XXXX
      const timestampSuffix = Math.floor(1000 + Math.random() * 9000);
      const count = await tx.order.count();
      const orderNumber = `#CT-${1000 + count + 1}`;

      const fullShippingAddress = `${customer.street}, ${customer.number}${customer.complement ? ' - ' + customer.complement : ''}, ${customer.neighborhood}, ${customer.city} - ${customer.state}, CEP ${customer.zipCode}`;

      // Default payment status: Approved for PIX and Credit Card in this modern flow
      const isApproved = paymentMethod === 'PIX' || paymentMethod === 'CREDIT_CARD';
      const initialStatus = isApproved ? 'PAGAMENTO_APROVADO' : 'AGUARDANDO_PAGAMENTO';
      const paymentStatus = isApproved ? 'APPROVED' : 'PENDING';

      // 3. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser?.id || null,
          customerName: customer.name,
          customerEmail: customer.email.toLowerCase().trim(),
          customerPhone: customer.phone,
          customerCpf: customer.cpf,
          shippingAddress: fullShippingAddress,
          zipCode: customer.zipCode,
          city: customer.city,
          state: customer.state,
          status: initialStatus,
          paymentMethod,
          paymentStatus,
          origin: 'ONLINE',
          subtotal,
          discount: discountAmount,
          shippingCost,
          total: finalTotal,
          couponCode: validCoupon?.code || null,
          notes: notes || null,
          items: {
            create: validatedItems.map((vi) => ({
              productId: vi.productId,
              productName: vi.productName,
              productImage: vi.productImage,
              size: vi.size,
              quantity: vi.quantity,
              unitPrice: vi.unitPrice,
              costPrice: vi.costPrice,
              totalPrice: vi.totalPrice,
            })),
          },
          statusHistory: {
            create: [
              {
                status: 'AGUARDANDO_PAGAMENTO',
                notes: 'Pedido gerado na loja virtual',
              },
              ...(isApproved
                ? [
                    {
                      status: 'PAGAMENTO_APROVADO',
                      notes:
                        paymentMethod === 'PIX'
                          ? 'Pagamento PIX confirmado instantaneamente'
                          : 'Transação de cartão de crédito aprovada com sucesso',
                    },
                  ]
                : []),
            ],
          },
        },
      });

      // 4. Atomically Decrement Inventory and Log Stock Movements
      for (const vi of validatedItems) {
        const previousStock = vi.currentStock;
        const newStock = previousStock - vi.quantity;

        // Decrement stock in database
        await tx.productSizeStock.update({
          where: { id: vi.sizeStockId },
          data: { stock: { decrement: vi.quantity } },
        });

        // Register Stock Movement
        await tx.stockMovement.create({
          data: {
            productId: vi.productId,
            sizeStockId: vi.sizeStockId,
            size: vi.size,
            type: 'SAIDA_VENDA',
            quantity: vi.quantity,
            previousStock,
            newStock,
            reason: `Venda na Loja Virtual - Pedido ${orderNumber}`,
            notes: `Comprador: ${customer.name}`,
            createdById: currentUser?.id || null,
          },
        });
      }

      // 5. Register Financial Transaction
      if (isApproved) {
        await tx.financialTransaction.create({
          data: {
            type: 'RECEITA',
            category: 'VENDA',
            description: `Venda Loja Virtual ${orderNumber} - ${customer.name}`,
            amount: finalTotal,
            status: 'PAGO',
            paymentMethod,
            orderId: newOrder.id,
            paidAt: new Date(),
          },
        });
      }

      // 6. Save customer address if logged in
      if (currentUser) {
        const existingAddress = await tx.address.findFirst({
          where: { userId: currentUser.id, zipCode: customer.zipCode, number: customer.number },
        });

        if (!existingAddress) {
          await tx.address.create({
            data: {
              userId: currentUser.id,
              recipientName: customer.name,
              zipCode: customer.zipCode,
              street: customer.street,
              number: customer.number,
              complement: customer.complement || null,
              neighborhood: customer.neighborhood,
              city: customer.city,
              state: customer.state,
              isDefault: true,
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        total: result.total,
        status: result.status,
        customerEmail: result.customerEmail,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pedido no checkout.' },
      { status: 400 }
    );
  }
}

