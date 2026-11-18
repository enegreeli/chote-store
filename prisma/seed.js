const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Chote Store...');

  // Clean existing data
  await prisma.financialTransaction.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productSizeStock.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 1. Create Users
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordClient = await bcrypt.hash('cliente123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Diretoria Chote Store',
      email: 'admin@chotestore.com',
      passwordHash: passwordAdmin,
      role: 'ADMIN',
      phone: '(11) 99876-5432',
      cpf: '000.111.222-33',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Carlos Gerente',
      email: 'gerente@chotestore.com',
      passwordHash: passwordAdmin,
      role: 'GERENTE',
      phone: '(11) 98765-4321',
      cpf: '111.222.333-44',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Lucas Estoquista',
      email: 'funcionario@chotestore.com',
      passwordHash: passwordAdmin,
      role: 'FUNCIONARIO',
      phone: '(11) 97654-3210',
      cpf: '222.333.444-55',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Gabriel Ferreira Silva',
      email: 'cliente@exemplo.com',
      passwordHash: passwordClient,
      role: 'CLIENTE',
      phone: '(11) 91234-5678',
      cpf: '333.444.555-66',
      addresses: {
        create: {
          recipientName: 'Gabriel Ferreira Silva',
          zipCode: '01310-100',
          street: 'Avenida Paulista',
          number: '1578',
          complement: 'Apt 102',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          isDefault: true,
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Mariana Costa Rios',
      email: 'mariana.costa@exemplo.com',
      passwordHash: passwordClient,
      role: 'CLIENTE',
      phone: '(21) 98888-7777',
      cpf: '444.555.666-77',
      addresses: {
        create: {
          recipientName: 'Mariana Costa',
          zipCode: '22041-001',
          street: 'Avenida Atlântica',
          number: '2100',
          complement: 'Bloco B, 501',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ',
          isDefault: true,
        },
      },
    },
  });

  console.log('✅ Users created');

  // 2. Categories
  const categoriesData = [
    { name: 'Grifes de Luxo', slug: 'grifes-luxo', description: 'Peças exclusivas das marcas mais consagradas: Lacoste, Hugo Boss, Ralph Lauren, Tommy Hilfiger', sortOrder: 1 },
    { name: 'Streetwear & Urban', slug: 'streetwear', description: 'Moda streetwear de alto padrão: Balenciaga, Armani Exchange, Nike Sportswear', sortOrder: 2 },
    { name: 'Times Internacionais', slug: 'times-internacionais', description: 'Mantos dos gigantes europeus e mundiais', sortOrder: 3 },
    { name: 'Times Nacionais', slug: 'times-nacionais', description: 'Camisas oficiais dos maiores clubes do futebol brasileiro', sortOrder: 4 },
    { name: 'Camisas Polo', slug: 'camisetas-polo', description: 'Elegância esportiva e casual: camisas polo em piquê nobre de marcas e clubes', sortOrder: 5 },
    { name: 'Camisetas Casuais', slug: 'camisetas-casuais', description: 'T-shirts em 100% algodão premium e cortes modernos', sortOrder: 6 },
    { name: 'Seleções', slug: 'selecoes', description: 'Uniformes das maiores potências do futebol mundial', sortOrder: 7 },
    { name: 'Camisas Retrô', slug: 'camisas-retro', description: 'Edições históricas e comemorativas inesquecíveis', sortOrder: 8 },
    { name: 'Versão Jogador', slug: 'jogador', description: 'Tecnologia de ponta idêntica à usada pelos atletas em campo', sortOrder: 9 },
    { name: 'Versão Torcedor', slug: 'torcedor', description: 'Conforto e qualidade premium para vestir no dia a dia', sortOrder: 10 },
    { name: 'Lançamentos', slug: 'lancamentos', description: 'Novidades recém-chegadas das melhores grifes e clubes', sortOrder: 11 },
    { name: 'Promoções', slug: 'promocoes', description: 'Oportunidades exclusivas com preços especiais por tempo limitado', sortOrder: 12 },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }
  categories['polos'] = categories['camisetas-polo'];
  categories['camisetas'] = categories['camisetas-casuais'];
  categories['retro'] = categories['camisas-retro'];
  console.log('✅ Categories created');

  // 3. Products
  const productsData = [
    {
      name: 'Camiseta Lacoste Classic Fit Pima Cotton Crocodilo',
      slug: 'camiseta-lacoste-classic-fit-pima-cotton-crocodilo',
      sku: 'LAC-TSH-001',
      barcode: '789100010031',
      description: 'Confeccionada em 100% algodão Pima peruano de fibras longas, proporcionando toque acetinado incomparável e durabilidade lendária. Apresenta o icônico crocodilo verde bordado no peito, gola redonda canelada e caimento Classic Fit impecável.',
      categorySlug: 'grifes-luxo',
      brand: 'Lacoste',
      team: '',
      country: 'França',
      season: 'Coleção Verão',
      modelType: 'GRIFE',
      supplier: 'Lacoste Brasil & França',
      acquisitionCost: 145.00,
      price: 389.90,
      promoPrice: 339.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 8, minStock: 3 },
        { size: 'G', stock: 7, minStock: 3 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Polo Hugo Boss Paddy Regular Fit Algodão Piquê',
      slug: 'polo-hugo-boss-paddy-regular-fit-algodao-pique',
      sku: 'BOS-POL-002',
      barcode: '789100010032',
      description: 'Polo icônica da grife Hugo Boss em piquê de algodão puro respirável. Detalhes com frisos contrastantes na gola e punhos, carcela com três botões gravados e logotipo Boss bordado no peito.',
      categorySlug: 'grifes-luxo',
      brand: 'Hugo Boss',
      team: '',
      country: 'Alemanha',
      season: 'Coleção Essential',
      modelType: 'GRIFE',
      supplier: 'Hugo Boss AG',
      acquisitionCost: 190.00,
      price: 529.90,
      promoPrice: 469.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 7, minStock: 3 },
        { size: 'G', stock: 6, minStock: 3 },
        { size: 'GG', stock: 2, minStock: 2 },
      ],
    },
    {
      name: 'Camiseta Ralph Lauren Custom Slim Fit Big Pony Bordado',
      slug: 'camiseta-ralph-lauren-custom-slim-fit-big-pony',
      sku: 'RL-TSH-003',
      barcode: '789100010033',
      description: 'Camiseta Ralph Lauren Custom Slim Fit em malha de algodão macio de gramatura nobre. Bordado em alta definição do clássico jogador de polo Big Pony e numeral 3 na manga.',
      categorySlug: 'grifes-luxo',
      brand: 'Ralph Lauren',
      team: '',
      country: 'EUA',
      season: 'Coleção Signature',
      modelType: 'GRIFE',
      supplier: 'Ralph Lauren Corp',
      acquisitionCost: 160.00,
      price: 429.90,
      promoPrice: null,
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 5, minStock: 2 },
        { size: 'M', stock: 9, minStock: 3 },
        { size: 'G', stock: 8, minStock: 3 },
        { size: 'GG', stock: 4, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Polo Tommy Hilfiger Core Regular Fit Bandeira',
      slug: 'polo-tommy-hilfiger-core-regular-fit-bandeira',
      sku: 'TH-POL-004',
      barcode: '789100010034',
      description: 'Polo clássica Tommy Hilfiger em piquê de algodão com toque elástico para conforto máximo. Logo da bandeira bordado no peito e botões perolados.',
      categorySlug: 'grifes-luxo',
      brand: 'Tommy Hilfiger',
      team: '',
      country: 'EUA',
      season: 'Coleção Heritage',
      modelType: 'GRIFE',
      supplier: 'PVH Corp / Tommy Hilfiger',
      acquisitionCost: 140.00,
      price: 379.90,
      promoPrice: 329.90,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: false,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 5, minStock: 2 },
        { size: 'M', stock: 8, minStock: 3 },
        { size: 'G', stock: 6, minStock: 3 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camiseta Armani Exchange Iconic Logo Streetwear Black',
      slug: 'camiseta-armani-exchange-iconic-logo-streetwear',
      sku: 'AX-TSH-005',
      barcode: '789100010035',
      description: 'T-shirt Armani Exchange da linha Streetwear com tipografia bold texturizada no peito. Tecido em malha nobre que oferece caimento fluído, toque gelado e elegância minimalista moderna.',
      categorySlug: 'streetwear',
      brand: 'Armani Exchange',
      team: '',
      country: 'Itália',
      season: 'Coleção Urban',
      modelType: 'STREETWEAR',
      supplier: 'Giorgio Armani S.p.A.',
      acquisitionCost: 130.00,
      price: 349.90,
      promoPrice: null,
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 6, minStock: 3 },
        { size: 'G', stock: 6, minStock: 3 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Moletom Balenciaga Boxy Fit Paris Edition',
      slug: 'moletom-balenciaga-boxy-fit-paris',
      sku: 'BAL-SWT-006',
      barcode: '789100010036',
      description: 'Moletom Balenciaga em algodão pesado (french terry 450 GSM) com modelagem boxy oversized e ombros caídos. Estampa discreta em alta densidade nas costas e capuz forrado anatômico.',
      categorySlug: 'streetwear',
      brand: 'Balenciaga',
      team: '',
      country: 'França',
      season: 'Coleção Winter',
      modelType: 'STREETWEAR',
      supplier: 'Kering Luxury Brands',
      acquisitionCost: 320.00,
      price: 899.90,
      promoPrice: 799.90,
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 5, minStock: 2 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 2, minStock: 2 },
      ],
    },
    {
      name: 'Camiseta Nike Sportswear x Jacquemus Premium Creme',
      slug: 'camiseta-nike-sportswear-jacquemus-creme',
      sku: 'NIK-JCQ-007',
      barcode: '789100010037',
      description: 'Colaboração icônica entre a Nike e a maison francesa Jacquemus. Confeccionada em algodão pesado com lavagem especial tom creme, mini swoosh metálico dourado na gola e modelagem relaxada.',
      categorySlug: 'streetwear',
      brand: 'Nike',
      team: '',
      country: 'EUA',
      season: 'Collab 2024',
      modelType: 'STREETWEAR',
      supplier: 'Nike Global Operations',
      acquisitionCost: 120.00,
      price: 329.90,
      promoPrice: 289.90,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 6, minStock: 2 },
        { size: 'M', stock: 9, minStock: 3 },
        { size: 'G', stock: 8, minStock: 3 },
        { size: 'GG', stock: 4, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Real Madrid Home 24/25 Authentic',
      slug: 'camisa-real-madrid-home-24-25-authentic',
      sku: 'RMA-HOM-2425-01',
      barcode: '789100010011',
      description: 'A nova camisa titular do Real Madrid para a temporada 24/25 traz o clássico branco imaculado com elegantes detalhes em padrão houndstooth sutil e listras douradas/pretas. Versão jogador com tecnologia Heat.Rdy que garante respirabilidade máxima e corte aerodinâmico.',
      categorySlug: 'times-internacionais',
      team: 'Real Madrid',
      country: 'Espanha',
      season: '2024/2025',
      modelType: 'JOGADOR',
      supplier: 'Adidas Global Supply',
      acquisitionCost: 145.00,
      price: 399.90,
      promoPrice: 349.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 8, minStock: 3 },
        { size: 'G', stock: 6, minStock: 3 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Flamengo Titular 2024/25 Torcedor',
      slug: 'camisa-flamengo-titular-2024-25-torcedor',
      sku: 'FLA-TIT-2425-02',
      barcode: '789100010012',
      description: 'O manto sagrado rubro-negro com faixas horizontais tradicionais mais espessas e detalhes prateados nas três listras. Tecido Aeroready com absorção rápida de suor e escudo bordado de alta precisão.',
      categorySlug: 'times-nacionais',
      team: 'Flamengo',
      country: 'Brasil',
      season: '2024/2025',
      modelType: 'TORCEDOR',
      supplier: 'Distribuidora Rubro-Negra',
      acquisitionCost: 120.00,
      price: 349.90,
      promoPrice: null,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 2, minStock: 2 },
        { size: 'M', stock: 12, minStock: 4 },
        { size: 'G', stock: 9, minStock: 3 },
        { size: 'GG', stock: 5, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Barcelona Home 24/25 125 Anos',
      slug: 'camisa-barcelona-home-24-25-125-anos',
      sku: 'FCB-125-2425-03',
      barcode: '789100010013',
      description: 'Edição histórica comemorativa dos 125 anos do FC Barcelona. Design dividido ao meio em grená e azul, remetendo ao primeiro uniforme do clube em 1899 com detalhes dourados no swoosh e escudo centralizado.',
      categorySlug: 'times-internacionais',
      team: 'Barcelona',
      country: 'Espanha',
      season: '2024/2025',
      modelType: 'JOGADOR',
      supplier: 'Nike International Hub',
      acquisitionCost: 155.00,
      price: 419.90,
      promoPrice: 389.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 7, minStock: 3 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 2, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Seleção Brasileira Amarela 2024 Copa América',
      slug: 'camisa-selecao-brasileira-amarela-2024',
      sku: 'BRA-CAN-2024-04',
      barcode: '789100010014',
      description: 'A lendária Amarelinha com grafismos texturizados celebrando a rica fauna e flora do Brasil. Escudo centralizado clássico e gola retrô sofisticada. Confeccionada em Dri-Fit ADV.',
      categorySlug: 'selecoes',
      team: 'Brasil',
      country: 'Brasil',
      season: '2024/2025',
      modelType: 'JOGADOR',
      supplier: 'Nike Brasil',
      acquisitionCost: 140.00,
      price: 389.90,
      promoPrice: 329.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 5, minStock: 2 },
        { size: 'M', stock: 10, minStock: 3 },
        { size: 'G', stock: 8, minStock: 3 },
        { size: 'GG', stock: 4, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Retrô Santos 1962 Bicampeão Mundial',
      slug: 'camisa-retro-santos-1962-bicampeao',
      sku: 'SAN-RET-1962-05',
      barcode: '789100010015',
      description: 'Homenagem eterna à era dourada de Pelé e Coutinho. Tecido 100% algodão premium penteado, escudo bordado artesanalmente com as duas estrelas mundiais e o clássico número 10 nas costas.',
      categorySlug: 'retro',
      team: 'Santos',
      country: 'Brasil',
      season: '1962 Retrô',
      modelType: 'RETRO',
      supplier: 'Retrô Mania Brand',
      acquisitionCost: 95.00,
      price: 289.90,
      promoPrice: 259.90,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: false,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 2, minStock: 2 },
        { size: 'M', stock: 4, minStock: 2 },
        { size: 'G', stock: 3, minStock: 2 },
        { size: 'GG', stock: 1, minStock: 2 }, // Alerta de estoque baixo!
      ],
    },
    {
      name: 'Camisa Manchester City Home 24/25 0161 Edition',
      slug: 'camisa-manchester-city-home-24-25',
      sku: 'MCI-HOM-2425-06',
      barcode: '789100010016',
      description: 'Camisa celeste do Manchester City com detalhes nos punhos e gola em referência ao código de área telefônico 0161 da cidade de Manchester. Tecnologia Puma dryCELL e acabamento primoroso.',
      categorySlug: 'times-internacionais',
      team: 'Manchester City',
      country: 'Inglaterra',
      season: '2024/2025',
      modelType: 'TORCEDOR',
      supplier: 'Puma Sports Global',
      acquisitionCost: 115.00,
      price: 349.90,
      promoPrice: null,
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 6, minStock: 2 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Palmeiras Home 2024/25 Dourada',
      slug: 'camisa-palmeiras-home-2024-25',
      sku: 'PAL-HOM-2425-07',
      barcode: '789100010017',
      description: 'Verde esmeralda com elegantes detalhes em dourado metálico comemorando a era de conquistas históricas do Alviverde Imponente.',
      categorySlug: 'times-nacionais',
      team: 'Palmeiras',
      country: 'Brasil',
      season: '2024/2025',
      modelType: 'TORCEDOR',
      supplier: 'Puma Brasil',
      acquisitionCost: 118.00,
      price: 349.90,
      promoPrice: 319.90,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: false,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 1, minStock: 2 }, // Alerta estoque baixo
        { size: 'M', stock: 5, minStock: 3 },
        { size: 'G', stock: 4, minStock: 2 },
        { size: 'GG', stock: 0, minStock: 2 }, // Esgotado!
      ],
    },
    {
      name: 'Camisa Retrô Japão 1998 Chamas Flame',
      slug: 'camisa-retro-japao-1998-chamas',
      sku: 'JPN-RET-1998-08',
      barcode: '789100010018',
      description: 'Uma das camisas mais cultuadas de todos os tempos. O modelo icônico usado pelo Japão na Copa do Mundo da França em 1998 com mangas em chamas ardentes.',
      categorySlug: 'retro',
      team: 'Japão',
      country: 'Japão',
      season: '1998 Retrô',
      modelType: 'RETRO',
      supplier: 'Vintage Kits Import',
      acquisitionCost: 110.00,
      price: 319.90,
      promoPrice: null,
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: false,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 2, minStock: 2 },
        { size: 'M', stock: 3, minStock: 2 },
        { size: 'G', stock: 2, minStock: 2 },
        { size: 'GG', stock: 1, minStock: 2 },
      ],
    },
    // CAMISAS POLO
    {
      name: 'Camisa Polo Real Madrid Viagem 24/25 Marinho',
      slug: 'camisa-polo-real-madrid-viagem-24-25',
      sku: 'RMA-POLO-2425-09',
      barcode: '789100010019',
      description: 'Camisa polo oficial de viagem e coletiva de imprensa do Real Madrid. Confeccionada em piquet encorpado de toque macio, com gola canelada, abotoamento frontal e escudo bordado monocromático em alta definição.',
      categorySlug: 'polos',
      team: 'Real Madrid',
      country: 'Espanha',
      season: '2024/2025',
      modelType: 'POLO',
      supplier: 'Adidas Global Supply',
      acquisitionCost: 98.00,
      price: 289.90,
      promoPrice: 249.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 7, minStock: 3 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Polo Flamengo Passeio Oficial Preta',
      slug: 'camisa-polo-flamengo-passeio-oficial',
      sku: 'FLA-POLO-2425-10',
      barcode: '789100010020',
      description: 'Estilo clássico e elegante para torcer com sofisticação em qualquer ambiente. Tecido respirável de algodão com elastano, detalhe em vermelho vivo na gola e escudo do Mengão bordado.',
      categorySlug: 'polos',
      team: 'Flamengo',
      country: 'Brasil',
      season: '2024/2025',
      modelType: 'POLO',
      supplier: 'Distribuidora Rubro-Negra',
      acquisitionCost: 92.00,
      price: 269.90,
      promoPrice: null,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1625910513413-7223b5d2c206?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 8, minStock: 3 },
        { size: 'G', stock: 6, minStock: 2 },
        { size: 'GG', stock: 2, minStock: 2 },
      ],
    },
    {
      name: 'Camisa Polo Seleção Brasileira Viagem Azul Royal',
      slug: 'camisa-polo-selecao-brasileira-viagem',
      sku: 'BRA-POLO-2024-11',
      barcode: '789100010021',
      description: 'Modelo usado pela comissão técnica e atletas nas viagens e aparições públicas. Tecido premium piquet respirável com detalhes em verde e amarelo na parte interna da gola.',
      categorySlug: 'polos',
      team: 'Brasil',
      country: 'Brasil',
      season: '2024/2025',
      modelType: 'POLO',
      supplier: 'Nike Brasil',
      acquisitionCost: 105.00,
      price: 299.90,
      promoPrice: 259.90,
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 6, minStock: 2 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    // CAMISETAS CASUAIS (T-SHIRTS)
    {
      name: 'Camiseta Casual Futebol Arte 100% Algodão Preta',
      slug: 'camiseta-casual-futebol-arte-preta',
      sku: 'FUT-ART-CAM-12',
      barcode: '789100010022',
      description: 'T-shirt streetwear em malha 100% algodão penteado fio 30.1 com toque peletizado aveludado. Estampa minimalista de alta durabilidade com tipografia elegante celebrando a essência do futebol arte.',
      categorySlug: 'camisetas',
      team: 'Futebol Clássico',
      country: 'Brasil',
      season: '2024',
      modelType: 'CAMISETA',
      supplier: 'Urban Football Studio',
      acquisitionCost: 45.00,
      price: 149.90,
      promoPrice: 129.90,
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 6, minStock: 2 },
        { size: 'M', stock: 12, minStock: 4 },
        { size: 'G', stock: 9, minStock: 3 },
        { size: 'GG', stock: 5, minStock: 2 },
      ],
    },
    {
      name: 'Camiseta Minimalista Urban FC Barcelona 1899',
      slug: 'camiseta-minimalista-fc-barcelona-1899',
      sku: 'FCB-CAM-1899-13',
      barcode: '789100010023',
      description: 'Estética urbana refinada com modelagem regular fit moderna. Malha 100% algodão orgânico, gola em ribana reforçada e estampa tipográfica sutil com o ano de fundação 1899 e as cores blaugrana.',
      categorySlug: 'camisetas',
      team: 'Barcelona',
      country: 'Espanha',
      season: '2024',
      modelType: 'CAMISETA',
      supplier: 'Nike International Hub',
      acquisitionCost: 48.00,
      price: 159.90,
      promoPrice: null,
      isFeatured: false,
      isBestSeller: true,
      isNewRelease: false,
      isPromo: false,
      images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 4, minStock: 2 },
        { size: 'M', stock: 8, minStock: 3 },
        { size: 'G', stock: 7, minStock: 2 },
        { size: 'GG', stock: 3, minStock: 2 },
      ],
    },
    {
      name: 'Camiseta Retrô Brasil Tri 1970 Algodão Penteado',
      slug: 'camiseta-retro-brasil-tri-1970',
      sku: 'BRA-CAM-1970-14',
      barcode: '789100010024',
      description: 'Camiseta inspirada no lendário esquadrão tricampeão de 1970 no México. Confeccionada em algodão premium com pré-encolhimento, caimento perfeito e estampa comemorativa do Tri Mundial.',
      categorySlug: 'camisetas',
      team: 'Brasil',
      country: 'Brasil',
      season: '1970 Retrô',
      modelType: 'CAMISETA',
      supplier: 'Retrô Mania Brand',
      acquisitionCost: 50.00,
      price: 169.90,
      promoPrice: 139.90,
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: true,
      isPromo: true,
      images: [
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop',
      ],
      sizes: [
        { size: 'P', stock: 3, minStock: 2 },
        { size: 'M', stock: 7, minStock: 3 },
        { size: 'G', stock: 5, minStock: 2 },
        { size: 'GG', stock: 2, minStock: 2 },
      ],
    },
  ];

  const createdProducts = [];

  for (const item of productsData) {
    const category = categories[item.categorySlug];
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        barcode: item.barcode,
        description: item.description,
        categoryId: category.id,
        brand: item.brand || '',
        team: item.team || '',
        country: item.country || '',
        season: item.season || '',
        modelType: item.modelType,
        supplier: item.supplier,
        acquisitionCost: item.acquisitionCost,
        price: item.price,
        promoPrice: item.promoPrice,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        isNewRelease: item.isNewRelease,
        isPromo: item.isPromo,
        images: {
          create: item.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        sizes: {
          create: item.sizes.map((s) => ({
            size: s.size,
            stock: s.stock,
            minStock: s.minStock,
          })),
        },
      },
      include: {
        sizes: true,
      },
    });

    createdProducts.push(product);

    // Register initial stock movement (ENTRADA) for each size
    for (const sizeObj of product.sizes) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          sizeStockId: sizeObj.id,
          size: sizeObj.size,
          type: 'ENTRADA',
          quantity: sizeObj.stock,
          previousStock: 0,
          newStock: sizeObj.stock,
          reason: 'Lote inicial cadastrado no sistema',
          createdById: admin.id,
        },
      });
    }
  }

  console.log(`✅ ${createdProducts.length} Products and initial stock movements registered`);

  // 4. Coupons
  const couponsData = [
    { code: 'BEMVINDO10', discountType: 'PERCENTAGE', discountValue: 10, minPurchaseValue: 150, maxUses: 500, expiresAt: new Date('2026-12-31') },
    { code: 'CHOTE30', discountType: 'FIXED', discountValue: 30, minPurchaseValue: 250, maxUses: 200, expiresAt: new Date('2026-12-31') },
    { code: 'FRETEGRATIS', discountType: 'FREE_SHIPPING', discountValue: 0, minPurchaseValue: 300, maxUses: 1000, expiresAt: new Date('2026-12-31') },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }
  console.log('✅ Coupons created');

  // 5. Create Realistic Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: '#CT-1001',
      userId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      customerCpf: customer1.cpf,
      shippingAddress: 'Avenida Paulista, 1578, Apt 102 - Bela Vista, São Paulo - SP, 01310-100',
      zipCode: '01310-100',
      city: 'São Paulo',
      state: 'SP',
      status: 'ENTREGUE',
      paymentMethod: 'PIX',
      paymentStatus: 'APPROVED',
      origin: 'ONLINE',
      subtotal: 349.90,
      discount: 34.99,
      shippingCost: 19.90,
      total: 334.81,
      couponCode: 'BEMVINDO10',
      trackingCode: 'BR892100412SP',
      notes: 'Cliente pediu embalagem especial para presente.',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            productImage: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800&auto=format&fit=crop',
            size: 'M',
            quantity: 1,
            unitPrice: 349.90,
            costPrice: 145.00,
            totalPrice: 349.90,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'AGUARDANDO_PAGAMENTO', notes: 'Pedido gerado via checkout' },
          { status: 'PAGAMENTO_APROVADO', notes: 'PIX confirmado pelo banco instantaneamente' },
          { status: 'EM_PREPARACAO', notes: 'Produto separado e embalado na expedição' },
          { status: 'ENVIADO', notes: 'Despachado via Correios Sedex rastreio BR892100412SP' },
          { status: 'ENTREGUE', notes: 'Entregue com sucesso ao destinatário' },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: '#CT-1002',
      userId: customer2.id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      customerCpf: customer2.cpf,
      shippingAddress: 'Avenida Atlântica, 2100, Bloco B, 501 - Copacabana, Rio de Janeiro - RJ, 22041-001',
      zipCode: '22041-001',
      city: 'Rio de Janeiro',
      state: 'RJ',
      status: 'EM_PREPARACAO',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'APPROVED',
      origin: 'ONLINE',
      subtotal: 739.80,
      discount: 0,
      shippingCost: 0, // Frete grátis acima de R$ 400
      total: 739.80,
      trackingCode: null,
      notes: 'Pedido aprovado no cartão em 3x sem juros.',
      items: {
        create: [
          {
            productId: createdProducts[1].id,
            productName: createdProducts[1].name,
            productImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop',
            size: 'G',
            quantity: 1,
            unitPrice: 349.90,
            costPrice: 120.00,
            totalPrice: 349.90,
          },
          {
            productId: createdProducts[2].id,
            productName: createdProducts[2].name,
            productImage: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop',
            size: 'M',
            quantity: 1,
            unitPrice: 389.90,
            costPrice: 155.00,
            totalPrice: 389.90,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'AGUARDANDO_PAGAMENTO', notes: 'Processando cartão de crédito' },
          { status: 'PAGAMENTO_APROVADO', notes: 'Transação autorizada pela operadora' },
          { status: 'EM_PREPARACAO', notes: 'Separando tamanhos G e M no armazém' },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: '#CT-1003',
      userId: null,
      customerName: 'Renato Balcão WhatsApp',
      customerEmail: 'renato.vendas@gmail.com',
      customerPhone: '(11) 97777-6655',
      customerCpf: '555.666.777-88',
      shippingAddress: 'Retirada no Balcão / Loja Física',
      zipCode: '01310-100',
      city: 'São Paulo',
      state: 'SP',
      status: 'PAGAMENTO_APROVADO',
      paymentMethod: 'MANUAL_WHATSAPP',
      paymentStatus: 'APPROVED',
      origin: 'MANUAL_WHATSAPP',
      subtotal: 329.90,
      discount: 29.90,
      shippingCost: 0,
      total: 300.00,
      trackingCode: null,
      notes: 'Venda direta realizada pelo WhatsApp oficial.',
      items: {
        create: [
          {
            productId: createdProducts[3].id,
            productName: createdProducts[3].name,
            productImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
            size: 'G',
            quantity: 1,
            unitPrice: 329.90,
            costPrice: 140.00,
            totalPrice: 329.90,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PAGAMENTO_APROVADO', notes: 'Comprovante conferido via WhatsApp e estoque baixado manualmente' },
        ],
      },
    },
  });

  console.log('✅ Sample orders created');

  // 6. Financial Transactions (Entradas & Saídas com separação clara de faturamento x custos x lucro)
  const financialRecords = [
    // Entradas
    {
      type: 'RECEITA',
      category: 'VENDA',
      description: 'Recebimento Venda #CT-1001 (PIX)',
      amount: 334.81,
      status: 'PAGO',
      paymentMethod: 'PIX',
      orderId: order1.id,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'RECEITA',
      category: 'VENDA',
      description: 'Recebimento Venda #CT-1002 (Cartão de Crédito)',
      amount: 739.80,
      status: 'PAGO',
      paymentMethod: 'CREDIT_CARD',
      orderId: order2.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'RECEITA',
      category: 'VENDA',
      description: 'Recebimento Venda Manual WhatsApp #CT-1003',
      amount: 300.00,
      status: 'PAGO',
      paymentMethod: 'PIX',
      orderId: order3.id,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    // Saídas / Despesas
    {
      type: 'DESPESA',
      category: 'COMPRA_MERCADORIA',
      description: 'Lote reposição Adidas Lançamentos 24/25 (30 peças)',
      amount: 4350.00,
      status: 'PAGO',
      paymentMethod: 'BOLETO',
      supplier: 'Adidas Global Supply',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'DESPESA',
      category: 'COMPRA_MERCADORIA',
      description: 'Lote Nike Seleções e Clubes (25 peças)',
      amount: 3625.00,
      status: 'PAGO',
      paymentMethod: 'TRANSFERENCIA',
      supplier: 'Nike International Hub',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'DESPESA',
      category: 'EMBALAGEM',
      description: 'Caixas personalizadas premium pretas fosca + papel seda com selo',
      amount: 380.00,
      status: 'PAGO',
      paymentMethod: 'PIX',
      supplier: 'Gráfica Luxury Boxes',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'DESPESA',
      category: 'FRETE',
      description: 'Fatura semanal fretes Correios e Jadlog',
      amount: 245.50,
      status: 'PAGO',
      paymentMethod: 'BOLETO',
      supplier: 'Correios / Jadlog',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'DESPESA',
      category: 'TAXA_GATEWAY',
      description: 'Taxas operacionais de intermediação de cartão e antifraude',
      amount: 54.30,
      status: 'PAGO',
      paymentMethod: 'DESCONTO_AUTOMATICO',
      supplier: 'Gateway Pagamentos',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'DESPESA',
      category: 'DESPESA_OPERACIONAL',
      description: 'Hospedagem de alta performance e domínio chotestore.com',
      amount: 149.00,
      status: 'PAGO',
      paymentMethod: 'CARTAO_CREDITO',
      supplier: 'Cloud Provider',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const f of financialRecords) {
    await prisma.financialTransaction.create({ data: f });
  }
  console.log('✅ Financial records created');

  // 7. Store Settings
  const settings = [
    { key: 'store_name', value: 'CHOTE KITS' },
    { key: 'store_tagline', value: 'Loja Oficial de Mantos & Camisas de Futebol Premium' },
    { key: 'whatsapp_number', value: '5511998765432' },
    { key: 'instagram_handle', value: '@chotestore.oficial' },
    { key: 'contact_email', value: 'contato@chotestore.com' },
    { key: 'store_address', value: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP' },
    { key: 'banner_title', value: 'TEMPORADA 2024/2025' },
    { key: 'banner_subtitle', value: 'Mantos oficiais dos maiores clubes do mundo com tecnologia de ponta e acabamento premium.' },
    { key: 'banner_button_text', value: 'EXPLORAR COLEÇÃO' },
    { key: 'banner_button_link', value: '/produtos' },
    { key: 'banner_image_url', value: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop' },
    { key: 'exchange_policy', value: 'Prazo de troca de até 30 dias corridos após o recebimento. O produto deve estar sem marcas de uso, com etiquetas intactas e na embalagem original.' },
    { key: 'privacy_policy', value: 'Seus dados pessoais são protegidos com criptografia de ponta a ponta e nunca serão compartilhados com terceiros.' },
    { key: 'terms_of_use', value: 'Todas as transações são intermediadas com segurança criptográfica. Enviamos código de rastreamento em até 24h úteis.' },
    { key: 'free_shipping_threshold', value: '399.00' },
  ];

  for (const s of settings) {
    await prisma.storeSetting.create({ data: s });
  }
  console.log('✅ Store settings configured');

  console.log('✨ All seed data successfully loaded into Chote Store database!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

