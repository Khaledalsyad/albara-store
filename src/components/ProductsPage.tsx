import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutGrid, Maximize2, List, ChevronDown, Filter as FilterIcon } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from './ProductCard';
import { Product } from '../types';

export default function ProductsPage({ 
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
  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-1' | 'list'>('grid-2');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...cats];
  }, [products]);

  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p => 
        p.nameAr.includes(searchQuery) || 
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => isArabic ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn));
        break;
      default:
        // 'featured' - maintain original order
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, sortBy, isArabic]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[#1B2A22] tracking-tighter uppercase">
            {searchQuery 
              ? (isArabic ? `نتائج البحث عن: ${searchQuery}` : `Search results for: ${searchQuery}`)
              : (isArabic ? 'المنتجات' : 'Products')}
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-y border-[#E8E2D9] py-4" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Sort */}
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 border border-[#E8E2D9] rounded-full px-6 py-2.5 text-sm font-bold text-[#1B2A22] hover:bg-[#E3E8E1] transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              <span>{isArabic ? 'الترتيب' : 'Sort'}</span>
            </button>
            {isSortOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white border border-[#E8E2D9] rounded-2xl shadow-xl z-50 p-2 overflow-hidden">
                {[
                  { id: 'featured', ar: 'المقترح', en: 'Featured' },
                  { id: 'price-low', ar: 'السعر: من الأقل', en: 'Price: Low to High' },
                  { id: 'price-high', ar: 'السعر: من الأعلى', en: 'Price: High to Low' },
                  { id: 'name', ar: 'الاسم', en: 'Name' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                      sortBy === option.id ? 'bg-[#4A6741] text-white' : 'hover:bg-[#F5F2EE] text-[#1B2A22]'
                    }`}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  >
                    {isArabic ? option.ar : option.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-2 bg-[#E3E8E1] p-1 rounded-xl">
             <button 
              onClick={() => setViewMode('grid-2')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid-2' ? 'bg-white shadow-sm text-[#1B2A22]' : 'text-[#8B7E74]'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid-1')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid-1' ? 'bg-white shadow-sm text-[#1B2A22]' : 'text-[#8B7E74]'}`}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1B2A22]' : 'text-[#8B7E74]'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${activeCategory !== 'all' ? 'text-[#4A6741]' : 'text-[#1B2A22] hover:text-[#4A6741]'}`}
            >
              <span>{isArabic ? 'تصفية' : 'Filter'}</span>
              <FilterIcon className="w-4 h-4" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full lg:left-auto lg:right-0 mt-2 w-48 bg-white border border-[#E8E2D9] rounded-2xl shadow-xl z-50 p-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 text-xs font-bold rounded-xl transition-colors capitalize ${
                      activeCategory === cat ? 'bg-[#4A6741] text-white' : 'hover:bg-[#F5F2EE] text-[#1B2A22]'
                    }`}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  >
                    {cat === 'all' ? (isArabic ? 'الكل' : 'All') : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid gap-3 md:gap-6 ${
          viewMode === 'grid-2' ? 'grid-cols-2 lg:grid-cols-4' : 
          viewMode === 'grid-1' ? 'grid-cols-1 md:grid-cols-2' : 
          'grid-cols-1'
        }`}>
          {processedProducts.map((product) => (
            <motion.div 
              layout 
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard 
                product={product} 
                isArabic={isArabic} 
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
