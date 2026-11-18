import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { cep, subtotal } = await req.json();

    if (!cep) {
      return NextResponse.json({ error: 'CEP obrigatório' }, { status: 400 });
    }

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: 'CEP inválido. Deve conter 8 dígitos.' }, { status: 400 });
    }

    // Try to get address info from ViaCEP
    let locationInfo = { uf: 'SP', localidade: 'São Paulo', logradouro: '', bairro: '' };
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          locationInfo = {
            uf: data.uf,
            localidade: data.localidade,
            logradouro: data.logradouro,
            bairro: data.bairro,
          };
        }
      }
    } catch {
      // fallback
    }

    // Calculate simulated realistic rates based on region
    const isSP = locationInfo.uf === 'SP';
    const isSoutheast = ['RJ', 'MG', 'ES'].includes(locationInfo.uf);
    const isSouth = ['PR', 'SC', 'RS'].includes(locationInfo.uf);

    let pacPrice = isSP ? 16.90 : isSoutheast ? 22.90 : isSouth ? 27.90 : 34.90;
    let sedexPrice = isSP ? 24.90 : isSoutheast ? 36.90 : isSouth ? 42.90 : 54.90;

    const isFreeEligible = Number(subtotal) >= 399;

    const options = [
      {
        id: 'pac',
        name: 'PAC - Envio Econômico',
        price: isFreeEligible ? 0 : pacPrice,
        originalPrice: pacPrice,
        days: isSP ? '3 a 5 dias úteis' : '5 a 8 dias úteis',
        isFree: isFreeEligible,
      },
      {
        id: 'sedex',
        name: 'SEDEX - Envio Expresso',
        price: sedexPrice,
        originalPrice: sedexPrice,
        days: isSP ? '1 a 2 dias úteis' : '2 a 4 dias úteis',
        isFree: false,
      },
    ];

    return NextResponse.json({
      success: true,
      location: locationInfo,
      options,
    });
  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 });
  }
}

