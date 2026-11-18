-- ========================================================
-- CHOTE KITS - SCHEMA SQL COMPLETO PARA SUPABASE / POSTGRESQL
-- Cole este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários (Clientes e Administradores)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENTE', -- 'ADMIN', 'GERENTE', 'FUNCIONARIO', 'CLIENTE'
    "phone" TEXT,
    "cpf" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Endereços
CREATE TABLE IF NOT EXISTS "Address" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "recipientName" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Categorias
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Produtos (Grifes de Luxo, Streetwear e Mantos de Futebol)
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "sku" TEXT UNIQUE NOT NULL,
    "barcode" TEXT,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
    "brand" TEXT NOT NULL DEFAULT '', -- 'Lacoste', 'Hugo Boss', 'Ralph Lauren', 'Tommy Hilfiger', 'Balenciaga', 'Nike', 'Adidas', etc.
    "team" TEXT DEFAULT '', -- Clube ou Seleção quando aplicável
    "country" TEXT DEFAULT '',
    "season" TEXT DEFAULT '',
    "modelType" TEXT NOT NULL DEFAULT 'GRIFE', -- 'GRIFE', 'JOGADOR', 'TORCEDOR', 'RETRO', 'POLO', 'CAMISETA', 'CASACO'
    "supplier" TEXT,
    "acquisitionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "promoPrice" DOUBLE PRECISION,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT FALSE,
    "isNewRelease" BOOLEAN NOT NULL DEFAULT FALSE,
    "isPromo" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Imagens do Produto
CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- 7. Estoque Individual por Tamanho (P, M, G, GG, etc.)
CREATE TABLE IF NOT EXISTS "ProductSizeStock" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 2,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "ProductSizeStock_productId_size_unique" UNIQUE ("productId", "size")
);

-- 8. Histórico de Movimentações de Estoque (Auditoria)
CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "sizeStockId" TEXT REFERENCES "ProductSizeStock"("id") ON DELETE SET NULL,
    "size" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'ENTRADA', 'SAIDA_VENDA', 'SAIDA_AVARIA', 'SAIDA_PERDA', 'DEVOLUCAO', 'AJUSTE'
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. Pedidos de Venda
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerCpf" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "origin" TEXT NOT NULL DEFAULT 'ONLINE',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "couponCode" TEXT,
    "trackingCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Itens do Pedido
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id"),
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL
);

-- 11. Histórico de Alterações de Status do Pedido
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. Fluxo Financeiro (DRE, Entradas e Saídas)
CREATE TABLE IF NOT EXISTS "FinancialTransaction" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "type" TEXT NOT NULL, -- 'RECEITA', 'DESPESA'
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "status" TEXT NOT NULL DEFAULT 'PAGO', -- 'PAGO', 'PENDENTE'
    "paymentMethod" TEXT,
    "orderId" TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "supplier" TEXT,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 13. Cupons de Desconto
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "code" TEXT UNIQUE NOT NULL,
    "discountType" TEXT NOT NULL, -- 'PERCENTAGE', 'FIXED', 'FREE_SHIPPING'
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minPurchaseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 14. Lista de Desejos / Favoritos
CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Wishlist_userId_productId_unique" UNIQUE ("userId", "productId")
);

-- 15. Configurações Globais da Loja
CREATE TABLE IF NOT EXISTS "StoreSetting" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================================
-- CRIAR BUCKET DE IMAGENS NO SUPABASE STORAGE (Se necessário)
-- ========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

