import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Scale } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../lib/utils';

export default function ProductCard({ 
  product, 
  isArabic, 
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: { 
  product: Product; 
  isArabic: boolean; 
  onAddToCart: (p: Product, weight: string, price: number) => void;
  onToggleWishlist: (id: string) => void;
  isInWishlist: boolean;
}) {
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0] || { value: '1/8', price: product.price, labelAr: 'ثمن', labelEn: '1/8 kg' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden border border-[#E8E2D9] hover:border-[#4A6741]/40 hover:shadow-2xl hover:shadow-[#1B2A22]/5 transition-all duration-500 p-1.5 md:p-3 shadow-sm flex flex-col"
    >
      <div className="aspect-square overflow-hidden rounded-[0.8rem] md:rounded-[1.5rem] bg-[#E3E8E1] relative cursor-pointer flex-shrink-0">
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-20" />
        <img 
          src={product.image} 
          alt={isArabic ? product.nameAr : product.nameEn}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 md:top-5 md:right-5 z-10 flex flex-col gap-1 md:gap-2">
            {product.tags?.map(tag => (
                <span key={tag} className="bg-[#1B2A22] text-white text-[8px] md:text-[9px] px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg">
                    {tag}
                </span>
            ))}
        </div>
        
        <button 
          onClick={() => onToggleWishlist(product.id)}
          className={cn(
            "absolute bottom-2 right-2 md:bottom-5 md:right-5 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
            isInWishlist ? "bg-red-500 text-white" : "bg-white text-[#1B2A22] hover:bg-[#1B2A22] hover:text-white"
          )}
        >
          <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isInWishlist && "fill-current")} />
        </button>
      </div>

      <div className="mt-2 md:mt-5 space-y-2 md:space-y-4 px-0.5 md:px-3 pb-1.5 flex-grow flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex flex-col justify-between items-start gap-0.5">
          <h3 className="text-[10px] md:text-lg font-black text-[#1B2A22] group-hover:text-[#4A6741] transition-colors leading-tight line-clamp-1">
            {isArabic ? product.nameAr : product.nameEn}
          </h3>
          <span className="text-[#4A6741] font-mono font-black text-[10px] md:text-lg whitespace-nowrap">
            {selectedWeight.price} <span className="text-[8px]">{isArabic ? 'ج.م' : 'EGP'}</span>
          </span>
        </div>

        <p className="hidden md:block text-xs text-[#8B7E74] line-clamp-2 leading-relaxed h-8">
          {isArabic ? product.descriptionAr : product.descriptionEn}
        </p>

        {/* Weight Selector */}
        <div className="hidden md:block space-y-1.5 md:space-y-2">
           <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-[#1B2A22] uppercase tracking-[0.1em]">
              <Scale className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {isArabic ? 'الوزن' : 'Weight'}
           </div>
           <div className="flex flex-wrap gap-1 md:gap-1.5">
             {product.weights.map((w) => (
               <button
                 key={w.value}
                 onClick={() => setSelectedWeight(w)}
                 className={cn(
                   "px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold transition-all border",
                   selectedWeight.value === w.value 
                     ? "bg-[#1B2A22] border-[#1B2A22] text-white shadow-md shadow-[#1B2A22]/20" 
                     : "bg-white border-[#E8E2D9] text-[#8B7E74] hover:border-[#1B2A22] hover:text-[#1B2A22]"
                 )}
               >
                 {isArabic ? w.labelAr : w.labelEn}
               </button>
             ))}
           </div>
        </div>
        
        <button 
          onClick={() => onAddToCart(product, selectedWeight.value, selectedWeight.price)}
          className="w-full mt-auto flex items-center justify-center gap-1 bg-[#E3E8E1] hover:bg-[#1B2A22] text-[#1B2A22] hover:text-white py-2 md:py-4 rounded-lg md:rounded-xl transition-all duration-300 font-black active:scale-95 text-[8px] md:text-[10px] uppercase tracking-widest"
        >
          <ShoppingCart className="w-3 md:w-4 h-3 md:h-4" />
          {isArabic ? 'أضف' : 'Add'}
        </button>
      </div>
    </motion.div>
  );
}
