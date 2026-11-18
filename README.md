# CHOTE KITS — Plataforma de E-Commerce & Painel Administrativo com Controle de Estoque em Tempo Real

Plataforma profissional, moderna e completa de e-commerce especializada na venda de camisas de futebol de alta performance, mantos oficiais e edições retrô históricas.

O projeto é composto por **duas plataformas totalmente integradas**:
1. **Loja Virtual (Storefront Público):** Ambiente com design premium minimalista (#111111, branco e tons de cinza), catálogo interativo, filtros avançados, carrinho deslizante, cupons de desconto, cálculo de frete por CEP, checkout completo e rastreamento em tempo real.
2. **Painel Administrativo:** Ambiente gerencial completo com controle rigoroso de estoque por tamanho (P, M, G, GG), auditoria de movimentações, cadastro e duplicação de produtos, gestão de vendas, venda manual (WhatsApp/balcão), controle financeiro com DRE (Diferenciação clara entre Faturamento Bruto x Custo das Mercadorias x Lucro Líquido Real), gestão de clientes, cupons e central de relatórios com exportação para CSV/Excel.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Instalar Dependências (já instaladas)
```bash
npm install
```

### 2. Banco de Dados e Migrações
O banco de dados SQLite local com Prisma Client já está configurado e sincronizado:
```bash
# Para resetar e carregar dados de demonstração completos:
node prisma/seed.js
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:3000`

---

## 🔑 Credenciais de Acesso (Demonstração / Testes Rápidos)

Na página de login (`/login`), foram incluídos botões de **preenchimento automático em 1 clique**:

| Papel | E-mail | Senha | Acesso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@chotestore.com` | `admin123` | Acesso total ao Painel Admin e configurações globais |
| **Gerente** | `gerente@chotestore.com` | `admin123` | Gestão de estoque, produtos, vendas e relatórios |
| **Funcionário** | `funcionario@chotestore.com` | `admin123` | Gestão de pedidos e estoque |
| **Cliente** | `cliente@exemplo.com` | `cliente123` | Loja virtual, histórico de compras e favoritos |

---

## 🏷️ Cupons de Desconto Disponíveis

- `BEMVINDO10`: 10% de desconto no pedido
- `CHOTE30`: R$ 30,00 de desconto fixo
- `FRETEGRATIS`: Frete 100% grátis

---

## 📦 Funcionalidades Implementadas

### 1. Loja Virtual
- **Identidade Visual Premium:** Cores `#111111`, `#FFFFFF`, `#F5F5F5` e `#888888`. Tipografia moderna e cards com efeitos discretos.
- **Home Completa:** Banner principal de alto impacto, carrossel de categorias, seções de Mais Vendidos, Lançamentos, Ofertas e selos de garantia.
- **Busca Global Instantânea:** Modal com busca em tempo real por time, país, temporada ou nome.
- **Catálogo com Filtros Múltiplos:** Filtros simultâneos por time, país, categoria, modelo (Jogador, Torcedor, Retrô, Camisas Polo, Camisetas Casuais), tamanho (P, M, G, GG), faixa de preço e ordenação.
- **Página de Detalhes do Produto:**
  - Galeria de fotos em alta resolução.
  - Seleção obrigatória de tamanho com indicador de estoque individual em tempo real.
  - Alertas de escassez quando restam poucas unidades.
  - Bloqueio de compra quando o tamanho ou produto estiver esgotado.
  - Tabela de medidas detalhada em centímetros.
  - Cálculo de frete e prazos por CEP integrado com a API dos Correios / ViaCEP.
  - Vitrine de produtos relacionados.
- **Carrinho de Compras Interativo:** Controle de quantidades com limite de estoque disponível, validação de cupons de desconto, barra de progresso para frete grátis (acima de R$ 399).
- **Checkout Seguro:** Formulário completo com auto-preenchimento por CEP, opções de PIX com QR Code dinâmico e código copia-e-cola, Cartão de Crédito em até 10x sem juros e Débito Online.
- **Acompanhamento de Pedidos & Rastreamento:** Timeline visual com 6 etapas de status (Aguardando Pagamento, Pagamento Aprovado, Em Preparação, Enviado com código Correios, Saiu para Entrega, Entregue ou Cancelado).
- **Área do Cliente:** Histórico de pedidos realizados, dados cadastrais e lista de favoritos / desejos com persistência local.

### 2. Painel Administrativo
- **Dashboard Gerencial:**
  - 10 KPIs em tempo real: Faturamento do dia, Faturamento do mês, Total de vendas, Pedidos pendentes, Pedidos concluídos, Produtos ativos, Estoque baixo, Sem estoque, Ticket médio e Lucro Bruto Real.
  - Gráfico de evolução diária de vendas e faturamento (Recharts).
  - Gráfico dos 5 produtos mais vendidos por volume.
  - Tabela de alertas críticos de reposição de estoque.
- **Controle de Estoque (Funcionalidade Principal):**
  - Tabela matricial exibindo cada produto com quantidades individuais nos tamanhos P, M, G, GG.
  - Modal para registrar movimentações imediatas: Entrada de mercadoria, Saída por avaria/defeito, Saída por perda/extravio, Devoluções e Ajuste de inventário físico.
  - Configuração de estoque mínimo por tamanho com alerta visual amarelo/vermelho.
  - **Transação Atômica no Banco de Dados:** Durante a compra, o sistema trava o item no banco, verifica a disponibilidade e decrementa o estoque, prevenindo overselling.
  - **Devolução Automática:** Caso um pedido seja cancelado no painel, as unidades são estornadas automaticamente ao estoque com registro de auditoria!
- **Auditoria de Movimentações:** Histórico imutável de todas as entradas e saídas com data/hora, operador responsável, tipo, quantidade e motivo.
- **Cadastro & Gestão de Produtos:**
  - Cadastro com fotos, SKU, código de barras, categoria, time, temporada, fornecedor, modelo (Jogador, Torcedor, Retrô, Camisa Polo, Camiseta Casual).
  - Preço de venda, custo de aquisição e cálculo automático da margem de lucro bruta percentual e monetária.
  - Duplicação de produtos com 1 clique (para criação rápida de variações).
  - Exclusão ou arquivamento seguro com proteção de integridade referencial.
- **Gestão de Pedidos:**
  - Visualização de todas as vendas com filtros por status e busca por cliente/número.
  - Atualização de status e inclusão de código de rastreamento.
  - Layout otimizado para impressão de pedidos / comprovantes de venda.
- **Venda Manual (WhatsApp / Instagram / Balcão):**
  - Formulário para registrar vendas feitas fora do site com baixa automática no estoque e inclusão no fluxo financeiro.
- **Controle Financeiro Completo:**
  - DRE com Faturamento Bruto, CMV (Custo das Mercadorias Vendidas calculado unitariamente), Despesas Operacionais, Lucro Bruto e Lucro Líquido Real.
  - Contas a pagar e contas a receber.
  - Cadastro de despesas avulsas (embalagens, frete, taxas de gateway, etc.).
  - Filtros por Hoje, Semana, Mês, Ano e Geral.
- **Gestão de Clientes:** Diretório completo com LTV (total gasto por cliente), total de pedidos e endereços cadastrados.
- **Cupons & Promoções:** Criação e ativação/desativação de cupons percentuais, fixos ou de frete grátis com limite de uso e datas de expiração.
- **Categorias:** Criação, edição, ordenação e exclusão de categorias da loja.
- **Central de Relatórios:**
  - Relatório de Estoque Atual por Tamanho
  - Relatório de Produtos Mais Vendidos
  - Relatório de Produtos Sem Giro (30 dias)
  - Relatório de Lucro Real por Manto
  - Relatório de Despesas Operacionais
  - Relatório de Movimentações de Estoque
  - Relatório de Clientes e Faturamento
  - **Exportação com 1 clique para planilha CSV compatível com Excel.**
- **Configurações da Loja:** Edição de dados de contato, WhatsApp, banners e políticas sem necessidade de alterar código.

---

## ⚡ Deploy Instantâneo na Vercel (100% Gratuito e Sem Banco Externo)

A loja está pronta para subir na Vercel sem precisar configurar nenhum banco de dados externo (PostgreSQL, Supabase, Neon ou Redis). Ela utiliza um motor de banco interno JSON de alta performance (`data/store_db.json`), com fallback automático para persistência em `/tmp` em ambiente serverless.

### Como subir na Vercel:
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Selecione o repositório **`enegreeli/chote-store`**.
4. Clique em **"Deploy"** (não precisa adicionar nenhuma variável de ambiente obrigatória).
5. Em menos de 2 minutos seu site estará no ar com domínio grátis `.vercel.app` e SSL automático!

---

## 🔑 Credenciais do Painel Administrativo

O acesso ao Painel Admin é restrito ao dono da loja:

| Campo | Valor |
| :--- | :--- |
| **URL de Acesso** | `/login` ou `/admin` |
| **E-mail** | `chote@store.com` |
| **Senha** | `chotestore2026` |

*(Os campos iniciam vazios com proteção contra vazamento de credenciais na interface)*

---

## 📸 Upload Direto de Imagens (PC e Celular)

- Você pode selecionar fotos diretamente dos seus arquivos do computador ou da galeria/câmera do celular.
- **Compressão Automática via Canvas:** O navegador redimensiona e comprime imagens de alta resolução em tempo real (~100KB), mantendo máxima nitidez e carregamento ultrarrápido sem estourar o limite da Vercel.
- **Organização Visual:** Defina qual foto é a principal com 1 clique, delete e adicione múltiplas fotos simultaneamente. Zero necessidade de serviços pagos de armazenamento como AWS S3 ou Supabase Storage.

---

## 🟢 Sincronização de Estoque e Produtos em Tempo Real

- **Sincronização Ativa Multi-Dispositivo:** O catálogo, página de produto e painel de estoque atualizam automaticamente em segundo plano sem que você precise recarregar a página (F5).
- **Proteção Anti-Overselling:** Assim que uma unidade é vendida ou atualizada no painel, os botões de tamanho (P, M, G, GG) e a vitrine pública refletem a quantidade real imediatamente, exibindo "Esgotado" caso as unidades acabem.
- **Indicador Visual:** Badges pulsantes `🟢 Tempo Real` mostram no painel administrativo e na loja que a conexão com o estoque está ativa e sincronizada.

