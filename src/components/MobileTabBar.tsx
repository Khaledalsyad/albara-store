import { Search, Heart, ShoppingCart, LayoutGrid, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileTabBar({ 
  isArabic, 
  cartCount, 
  wishlistCount,
  onOpenCart,
  onOpenSearch
}: { 
  isArabic: boolean; 
  cartCount: number; 
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#E8E2D9] z-[999] h-[72px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div className="h-full max-w-lg mx-auto flex justify-around items-center px-1" dir={isArabic ? 'rtl' : 'ltr'}>
        <Link to="/products" className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 group">
          <LayoutGrid className="w-5 h-5 text-[#1B2A22] stroke-[2]" />
          <span className="text-[9px] font-bold text-[#1B2A22] whitespace-nowrap">{isArabic ? 'المتجر' : 'Shop'}</span>
        </Link>
        
        <Link to="/track" className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 group">
          <Package className="w-5 h-5 text-[#1B2A22] stroke-[2]" />
          <span className="text-[9px] font-bold text-[#1B2A22] whitespace-nowrap">{isArabic ? 'تتبع طلبك' : 'Track'}</span>
        </Link>

        <button onClick={onOpenCart} className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 relative group">
          <ShoppingCart className="w-5 h-5 text-[#1B2A22] stroke-[2]" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-1/2 translate-x-3 -translate-y-1 bg-[#4A6741] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in zoom-in duration-300">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-bold text-[#1B2A22] whitespace-nowrap">{isArabic ? 'السلة' : 'Cart'}</span>
        </button>

        <button onClick={onOpenSearch} className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 group">
          <Search className="w-5 h-5 text-[#1B2A22] stroke-[2]" />
          <span className="text-[9px] font-bold text-[#1B2A22] whitespace-nowrap">{isArabic ? 'بحث' : 'Search'}</span>
        </button>
      </div>
    </div>
  );
}
