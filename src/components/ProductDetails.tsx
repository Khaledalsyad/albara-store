import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Users, ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { cn } from '../lib/utils';

export default function ProductDetails({ 
  isArabic, 
  products, 
  onAddToCart,
  onToggleWishlist,
  wishlist
}: { 
  isArabic: boolean; 
  products: Product[]; 
  onAddToCart: (p: Product, w: string, pr: number) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
}) {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [viewingCount, setViewingCount] = useState(Math.floor(Math.random() * 15) + 5);
  const [selectedWeight, setSelectedWeight] = useState(product?.weights?.[0] || { value: '1/8', price: product?.price || 0, labelAr: 'ثمن', labelEn: '1/8 kg' });
  const isInWishlist = product ? wishlist.includes(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    const interval = setInterval(() => {
      setViewingCount(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (product) {
        setSelectedWeight(product.weights[0]);
    }
  }, [product]);

  if (!product) return <div className="py-40 text-center">Product not found</div>;

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="pt-32 pb-24 px-6 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-12" dir={isArabic ? 'rtl' : 'ltr'}>
          <Link to="/" className="text-[#8B7E74] hover:text-[#C49B66] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isArabic ? 'العودة للمتجر' : 'Back to Shop'}
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white"
          >
            <img 
              src={product.image} 
              alt={isArabic ? product.nameAr : product.nameEn} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => onToggleWishlist(product.id)}
              className={cn(
                "absolute top-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-10",
                isInWishlist ? "bg-red-500 text-white" : "bg-white text-[#3D3028] hover:bg-gray-100"
              )}
            >
              <Heart className={cn("w-6 h-6", isInWishlist && "fill-current")} />
            </button>
          </motion.div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-[#C49B66] text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
                    {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <span className="text-[#8B7E74] text-xs font-bold ml-2">(128 {isArabic ? 'تقييم' : 'reviews'})</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[#3D3028] border-b border-[#E8E2D9] pb-8 tracking-tighter leading-tight">
                {isArabic ? product.nameAr : product.nameEn}
              </h1>
            </div>

            <div className="flex items-center gap-4 bg-[#C49B66]/5 p-4 rounded-2xl border border-[#C49B66]/20">
                <Users className="w-5 h-5 text-[#C49B66]" />
                <p className="text-sm font-bold text-[#3D3028]">
                    <span className="text-[#C49B66]">{viewingCount}</span> {isArabic ? 'أشخاص يشاهدون هذا المنتج الآن' : 'people are viewing this product now'}
                </p>
            </div>

            <p className="text-xl text-[#6B5E55] leading-relaxed italic font-medium">
                {isArabic ? product.descriptionAr : product.descriptionEn}
            </p>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-black text-[#3D3028] tracking-tighter">{selectedWeight.price} {isArabic ? 'ج.م' : 'EGP'}</span>
              <span className="text-[#8B7E74] text-sm line-through opacity-50 mb-1">{selectedWeight.price + 20} {isArabic ? 'ج.م' : 'EGP'}</span>
            </div>

            {/* Selection Options */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74]">{isArabic ? 'اختر الوزن' : 'Select Weight'}</label>
                    <div className="flex flex-wrap gap-2">
                        {product.weights.map(w => (
                            <button 
                                key={w.value} 
                                onClick={() => setSelectedWeight(w)}
                                className={cn(
                                    "px-6 py-3 text-xs font-bold border rounded-xl transition-all",
                                    selectedWeight.value === w.value 
                                        ? "bg-[#3D3028] border-[#3D3028] text-white shadow-lg" 
                                        : "bg-white border-[#E8E2D9] text-[#8B7E74] hover:border-[#3D3028] hover:text-[#3D3028]"
                                )}
                            >
                                {isArabic ? w.labelAr : w.labelEn}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74]">{isArabic ? 'نوع الطحنة' : 'Grind Type'}</label>
                    <select className="w-full bg-white border border-[#E8E2D9] rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#C49B66] appearance-none">
                        <option>{isArabic ? 'حبوب كاملة' : 'Whole Beans'}</option>
                        <option>Espresso</option>
                        <option>V60 / Drip</option>
                        <option>Turkish</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onAddToCart(product, selectedWeight.value, selectedWeight.price)}
                className="flex-1 bg-[#3D3028] hover:bg-[#2C2420] text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl shadow-[#3D3028]/20"
              >
                <ShoppingCart className="w-5 h-5" />
                {isArabic ? 'أضف للسلة' : 'Add to Cart'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#E8E2D9] pt-8">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C49B66]" />
                    <span className="text-xs font-bold text-[#8B7E74] uppercase tracking-widest">{isArabic ? 'منتج أصلي 100%' : '100% Authentic'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C49B66]" />
                    <span className="text-xs font-bold text-[#8B7E74] uppercase tracking-widest">{isArabic ? 'شحن سريع' : 'Fast Shipping'}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Reviews Simulation */}
        <section className="mt-32">
          <h2 className="text-3xl font-black text-[#3D3028] mb-12 border-b border-[#E8E2D9] pb-6">
            {isArabic ? 'آراء العملاء' : 'Customer Reviews'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-[#6B5E55] text-sm mb-6 font-medium leading-relaxed italic">
                  {isArabic 
                    ? '"جودة القهوة ممتازة جداً والتغليف رائع، والريحة تفتح النفس من قبل ما افتح الكيس."' 
                    : '"The coffee quality is excellent, the packaging is great, and the aroma is amazing even before opening the bag."'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F2EE] flex items-center justify-center text-[#C49B66] font-bold text-xs border border-[#E8E2D9]">
                    {i === 1 ? 'A' : i === 2 ? 'M' : 'S'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#3D3028]">{i === 1 ? 'Ahmed K.' : i === 2 ? 'Mona S.' : 'Sara L.'}</div>
                    <div className="text-[10px] text-[#8B7E74] uppercase tracking-widest">Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggest Other Products */}
        <section className="mt-32">
            <div className="flex justify-between items-end mb-12" dir={isArabic ? 'rtl' : 'ltr'}>
                <h2 className="text-3xl font-black text-[#3D3028]">
                    {isArabic ? 'قد يعجبك أيضاً' : 'You May Also Like'}
                </h2>
                <Link to="/" className="text-[#C49B66] text-xs font-bold uppercase tracking-widest border-b border-[#C49B66]">
                    {isArabic ? 'عرض الكل' : 'View All'}
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map(p => (
                    <div key={p.id}>
                        <ProductCard 
                          product={p} 
                          isArabic={isArabic} 
                          onAddToCart={onAddToCart}
                          onToggleWishlist={onToggleWishlist}
                          isInWishlist={wishlist.includes(p.id)}
                        />
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
