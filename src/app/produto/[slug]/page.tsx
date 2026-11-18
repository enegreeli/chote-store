'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Check,
  AlertCircle,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatCEP } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // CEP shipping calculator state
  const [cep, setCep] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[] | null>(null);
  const [shippingError, setShippingError] = useState('');

  // Add to cart feedback
  const [addNotice, setAddNotice] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          // auto-select first available size
          const firstInStock = data.product.sizes?.find((s: any) => s.stock > 0);
          if (firstInStock) {
            setSelectedSize(firstInStock.size);
          }
        }
        if (data.related) {
          setRelated(data.related);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-neutral-100 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-neutral-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-100 rounded w-3/4" />
            <div className="h-6 bg-neutral-100 rounded w-1/3" />
            <div className="h-24 bg-neutral-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900">Produto não encontrado</h2>
        <p className="text-xs text-neutral-500 mt-2">Este produto pode ter sido descontinuado ou o link está incorreto.</p>
        <Link
          href="/produtos"
          className="mt-6 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const effectivePrice = product.promoPrice || product.price;
  const isFavorited = isInWishlist(product.id);
  const images = product.images && product.images.length > 0
    ? product.images.map((i: any) => i.url)
    : ['https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800'];

  const selectedSizeStockObj = product.sizes?.find((s: any) => s.size === selectedSize);
  const currentSizeStock = selectedSizeStockObj?.stock || 0;
  const isSizeOutOfStock = currentSizeStock <= 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAddNotice('Por favor, selecione um tamanho antes de continuar.');
      return;
    }

    if (isSizeOutOfStock) {
      setAddNotice(`O tamanho ${selectedSize} está esgotado no momento.`);
      return;
    }

    const res = addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: images[0],
      size: selectedSize,
      unitPrice: effectivePrice,
      costPrice: product.acquisitionCost || 0,
      maxStock: currentSizeStock,
    }, 1);

    if (res.success) {
      setAddNotice('Produto adicionado ao seu carrinho!');
      setTimeout(() => setAddNotice(null), 3000);
    } else {
      setAddNotice(res.message || 'Não foi possível adicionar ao carrinho.');
    }
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setShippingLoading(true);
    setShippingError('');
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: clean, subtotal: effectivePrice }),
      });
      const data = await res.json();
      if (res.ok && data.options) {
        setShippingOptions(data.options);
      } else {
        setShippingError(data.error || 'Erro ao calcular frete');
      }
    } catch {
      setShippingError('Erro de conexão ao consultar frete.');
    } finally {
      setShippingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-black">Início</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/produtos" className="hover:text-black">Catálogo</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {product.isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded">
                  Esgotado
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3">
              {images.map((url: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-black' : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={url} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Size, Stock, Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
              <span>{product.brand || product.team || 'Grife'}</span>
              {product.team && product.brand && <span>• {product.team}</span>}
              {product.season && (
                <>
                  <span>•</span>
                  <span>{product.season}</span>
                </>
              )}
              {product.country && (
                <>
                  <span>•</span>
                  <span>{product.country}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                {product.modelType === 'GRIFE'
                  ? 'Grife de Luxo'
                  : product.modelType === 'STREETWEAR'
                  ? 'Streetwear Premium'
                  : product.modelType === 'JOGADOR'
                  ? 'Versão Jogador (Authentic)'
                  : product.modelType === 'RETRO'
                  ? 'Edição Retrô Histórica'
                  : product.modelType === 'POLO'
                  ? 'Camisa Polo Oficial'
                  : product.modelType === 'CAMISETA'
                  ? 'Camiseta Casual 100% Algodão'
                  : 'Versão Torcedor (Fan)'}
              </span>
              <span className="text-xs text-neutral-400">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900">
                {formatCurrency(effectivePrice)}
              </span>
              {product.promoPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              em até <span className="font-bold text-neutral-900">10x de {formatCurrency(effectivePrice / 10)}</span> sem juros no cartão ou com desconto no PIX
            </p>
          </div>

          {/* Size Selector with real live stock */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Selecione o Tamanho:
              </span>
              <button
                type="button"
                onClick={() => setShowSizeModal(true)}
                className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 underline underline-offset-2"
              >
                <Ruler className="w-3.5 h-3.5" /> Tabela de Medidas
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {product.sizes?.map((sz: any) => {
                const inStock = sz.stock > 0;
                const isSelected = selectedSize === sz.size;

                return (
                  <button
                    key={sz.id}
                    disabled={!inStock}
                    onClick={() => {
                      setSelectedSize(sz.size);
                      setAddNotice(null);
                    }}
                    className={`relative py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      !inStock
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-sm">{sz.size}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {inStock ? `${sz.stock} un.` : 'Esgotado'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stock Alert Notice */}
            {selectedSize && (
              <div className="pt-1">
                {currentSizeStock > 0 && currentSizeStock <= 3 ? (
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Atenção: restam apenas {currentSizeStock} unidade(s) no tamanho {selectedSize}!
                  </p>
                ) : currentSizeStock > 3 ? (
                  <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Tamanho {selectedSize} disponível em estoque para pronta entrega ({currentSizeStock} unidades).
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    O tamanho {selectedSize} está esgotado no momento.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Notice message */}
          {addNotice && (
            <div className="p-3 bg-neutral-900 text-white text-xs font-medium rounded-lg animate-in fade-in">
              {addNotice}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock || isSizeOutOfStock}
              className="flex-1 py-4 bg-[#111111] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.isOutOfStock ? 'Produto Esgotado' : isSizeOutOfStock ? 'Tamanho Indisponível' : 'Adicionar ao Carrinho'}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="p-4 rounded-xl border border-neutral-300 hover:border-black text-neutral-800 transition-colors"
              title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Shipping Calculation */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900">
              <Truck className="w-4 h-4 text-neutral-500" />
              Calcular Frete e Prazo de Entrega
            </div>

            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(formatCEP(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                className="w-44 px-3 py-2 text-xs font-medium border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={shippingLoading}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {shippingLoading ? 'Calculando...' : 'Calcular'}
              </button>
            </form>

            {shippingError && (
              <p className="text-xs text-rose-600">{shippingError}</p>
            )}

            {shippingOptions && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                {shippingOptions.map((opt) => (
                  <div key={opt.id} className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-900">{opt.name}</span>
                      <p className="text-[11px] text-neutral-500">{opt.days}</p>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {opt.price === 0 ? <span className="text-emerald-700">GRÁTIS</span> : formatCurrency(opt.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-neutral-200 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Descrição do Produto</h3>
            <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Sizing Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Tabela de Medidas (cm)</h3>
              <button onClick={() => setShowSizeModal(false)} className="text-neutral-400 hover:text-black">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 border-b">
                  <tr>
                    <th className="p-2">Tamanho</th>
                    <th className="p-2">Largura (Tórax)</th>
                    <th className="p-2">Comprimento</th>
                    <th className="p-2">Altura Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="p-2 font-bold">P</td>
                    <td className="p-2">50 - 52 cm</td>
                    <td className="p-2">70 - 72 cm</td>
                    <td className="p-2">1,60 - 1,70 m</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">M</td>
                    <td className="p-2">53 - 55 cm</td>
                    <td className="p-2">73 - 75 cm</td>
                    <td className="p-2">1,70 - 1,80 m</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">G</td>
                    <td className="p-2">56 - 58 cm</td>
                    <td className="p-2">76 - 78 cm</td>
                    <td className="p-2">1,80 - 1,90 m</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">GG</td>
                    <td className="p-2">59 - 62 cm</td>
                    <td className="p-2">79 - 82 cm</td>
                    <td className="p-2">1,90 m ou mais</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-neutral-400">
              * As medidas podem variar até 2 cm dependendo do modelo (Jogador, Torcedor, Grife ou Polo).
            </p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-neutral-200">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Você também pode gostar</span>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Produtos Relacionados</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

