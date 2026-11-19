import { NextResponse } from 'next/server';
import { getCurrentUser, isStaffOrAdmin } from '@/lib/auth';
import { storeDb } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = storeDb.getRawData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao exportar dados' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const isAuthed = user && isStaffOrAdmin(user.role);

    const body = await req.json();
    const { action, productId, data } = body;

    const serverIsEmpty = (storeDb.getRawData().products || []).length === 0;

    // Allow auto-heal restore if server is completely empty
    if (!isAuthed && !(action === 'import_json' && serverIsEmpty)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (action === 'zero_all_stock') {
      const affected = storeDb.zeroAllStock();
      return NextResponse.json({
        success: true,
        message: `Estoque de todos os produtos foi zerado com sucesso (${affected} tamanhos zerados).`,
      });
    }

    if (action === 'zero_product_stock') {
      if (!productId) {
        return NextResponse.json({ error: 'ID do produto não informado' }, { status: 400 });
      }
      const affected = storeDb.zeroProductStock(productId);
      return NextResponse.json({
        success: true,
        message: `Estoque do produto zerado com sucesso (${affected} tamanhos zerados).`,
      });
    }

    if (action === 'wipe_products') {
      const result = storeDb.wipeAllProducts();
      return NextResponse.json({
        success: true,
        message: `Catálogo de produtos completamente limpo (${result.productsRemoved} produtos removidos). Pronto para cadastrar do zero.`,
      });
    }

    if (action === 'wipe_all_data') {
      storeDb.wipeEverything(true);
      return NextResponse.json({
        success: true,
        message: 'Loja resetada com sucesso para o estado inicial limpo. O usuário administrador foi preservado.',
      });
    }

    if (action === 'import_json') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json({ error: 'Dados JSON inválidos' }, { status: 400 });
      }
      const current = storeDb.getRawData();
      Object.assign(current, data);
      storeDb.save();
      return NextResponse.json({ success: true, message: 'Dados restaurados com sucesso!' });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('System reset error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao executar ação no sistema' }, { status: 500 });
  }
}
