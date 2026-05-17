import { useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

const MAIN_CATEGORIES = [
  { id: 'coffee', ar: 'بن بأنواعه', en: 'Coffee Types' },
  { id: 'flavored', ar: 'نكهات', en: 'Flavors' },
];

const SUB_CATEGORIES = {
  coffee: [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'brazilian', ar: 'برازيلي', en: 'Brazilian' },
    { id: 'colombian', ar: 'كولومي', en: 'Colombian' },
    { id: 'yemeni', ar: 'يمني', en: 'Yemeni' },
    { id: 'specialty', ar: 'حبشي', en: 'Abyssinian' },
    { id: 'blends', ar: 'توليفات', en: 'Blends' },
    { id: 'weight-loss', ar: 'أخضر', en: 'Green' },
    { id: 'espresso', ar: 'اسبريسو', en: 'Espresso' },
  ],
  flavored: [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'flavored', ar: 'نكهات', en: 'Flavors' },
  ]
};

export default function ProductGrid({ 
  products, 
  isArabic, 
  onAddToCart,
  onToggleWishlist,
  wishlist
}: { 
  products: Product[]; 
  isArabic: boolean; 
  onAddToCart: (p: Product, w: string, pr: number) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
}) {
  const [activeMain, setActiveMain] = useState('coffee');
  const [activeSub, setActiveSub] = useState('all');

  const filteredProducts = products.filter(p => {
    const isMainMatch = activeMain === 'coffee' 
      ? p.category !== 'flavored' 
      : p.category === 'flavored';
    
    if (!isMainMatch) return false;
    if (activeSub === 'all') return true;
    return p.category === activeSub;
  });

  return (
    <section id="products" className="py-12 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8 md:mb-16 gap-6 md:gap-8">
          {/* Main Category Tabs */}
          <div className="flex bg-white border border-[#E8E2D9] p-1.5 rounded-[2rem] shadow-sm scale-90 md:scale-100">
            {MAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveMain(cat.id);
                  setActiveSub('all');
                }}
                className={`px-6 md:px-10 py-2.5 md:py-3.5 rounded-[1.8rem] text-xs md:text-sm font-black transition-all ${
                  activeMain === cat.id 
                    ? 'bg-[#3D4D3D] text-white shadow-md' 
                    : 'text-[#8B7E74] hover:text-[#3D4D3D]'
                }`}
              >
                {isArabic ? cat.ar : cat.en}
              </button>
            ))}
          </div>

          {/* Sub Category Pills */}
          <div className="flex md:flex-wrap items-center justify-start md:justify-center gap-2 md:gap-3 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar" dir={isArabic ? 'rtl' : 'ltr'}>
            {(SUB_CATEGORIES as any)[activeMain].map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveSub(cat.id)}
                className={`flex-shrink-0 px-5 md:px-7 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold border transition-all ${
                  activeSub === cat.id 
                    ? 'bg-[#3D4D3D] border-[#3D4D3D] text-white' 
                    : 'bg-white border-[#E8E2D9] text-[#8B7E74] hover:border-[#3D4D3D] hover:text-[#3D4D3D]'
                }`}
              >
                {isArabic ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <ProductCard 
                product={product} 
                isArabic={isArabic} 
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
