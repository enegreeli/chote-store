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

## 🗄️ Integração com Supabase / PostgreSQL em Produção

O projeto foi construído sobre o **Prisma ORM**, o que torna a migração para **PostgreSQL / Supabase** trivial:

1. No arquivo `prisma/schema.prisma`, altere o bloco datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
2. No arquivo `.env`, adicione sua string de conexão do Supabase ou PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres"
```
3. Execute o comando de sincronização:
```bash
npx prisma db push
node prisma/seed.js
```
O banco PostgreSQL receberá automaticamente todas as tabelas relacionais com chaves estrangeiras e integridade referencial.

