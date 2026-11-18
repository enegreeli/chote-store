export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return '-';
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return cep;
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando Pagamento',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  PAGAMENTO_APROVADO: {
    label: 'Pagamento Aprovado',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  EM_PREPARACAO: {
    label: 'Em Preparação',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  ENVIADO: {
    label: 'Enviado',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  SAIU_PARA_ENTREGA: {
    label: 'Saiu para Entrega',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  ENTREGUE: {
    label: 'Entregue',
    color: 'text-green-800',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  PIX: 'PIX (Aprovação Imediata)',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  MANUAL_WHATSAPP: 'Venda Balcão / WhatsApp',
  MANUAL_BALCAO: 'Venda Presencial / Balcão',
};

export const MOVEMENT_TYPE_MAP: Record<string, { label: string; sign: string; color: string }> = {
  ENTRADA: { label: 'Entrada de Mercadoria', sign: '+', color: 'text-emerald-600' },
  SAIDA_VENDA: { label: 'Venda de Produto', sign: '-', color: 'text-rose-600' },
  SAIDA_AVARIA: { label: 'Avaria / Defeito', sign: '-', color: 'text-amber-600' },
  SAIDA_PERDA: { label: 'Perda / Extravio', sign: '-', color: 'text-red-700' },
  DEVOLUCAO: { label: 'Devolução / Cancelamento', sign: '+', color: 'text-blue-600' },
  AJUSTE: { label: 'Ajuste de Inventário', sign: '±', color: 'text-neutral-700' },
};

