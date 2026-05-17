import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Globe, Search, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar({ 
  cartCount, 
  wishlistCount,
  isArabic, 
  toggleLang, 
  onOpenCart,
  isSearchOpen,
  setIsSearchOpen
}: { 
  cartCount: number; 
  wishlistCount: number;
  isArabic: boolean; 
  toggleLang: () => void;
  onOpenCart: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { ar: 'المنتجات', en: 'Products', href: '/products' },
    { ar: 'من نحن', en: 'About Us', href: '/#about' },
    { ar: 'تتبع طلبك', en: 'Track Order', href: '/track' },
    { ar: 'تواصل معنا', en: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      } else {
        // If not on home page, maybe navigate to home then scroll? 
        // For simplicity, we assume we are on home page when clicking hash links
        window.location.href = '/' + href;
      }
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-10 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md py-4 shadow-sm border-b border-[#E8E2D9]" : "bg-transparent py-6"
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        {/* Mobile Left Icons: Search and Cart */}
        <div className="lg:hidden flex items-center gap-1">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="text-[#1B2A22] hover:text-[#4A6741] p-2 transition-colors"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button 
            onClick={onOpenCart}
            className="text-[#1B2A22] hover:text-[#4A6741] relative p-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 bg-[#1B2A22] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Logo - Center on mobile, Right on Desktop in Arabic */}
        <div className="flex items-center lg:flex-initial flex-1 justify-center lg:justify-start">
        <Link 
          to="/" 
          className="flex items-center justify-center lg:justify-end group transition-transform hover:scale-105"
        >
          <img
            src="https://www.image2url.com/r2/default/images/1778939160955-619ea68a-f09d-4c7f-9e14-39c3aa1416f4.png"
            alt="Al-Baraa Logo"
            referrerPolicy="no-referrer"
            className="h-12 lg:h-16 w-auto object-contain"
          />
        </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-10 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.en}
              to={link.href} 
              onClick={(e: any) => handleNavClick(e, link.href)}
              className="text-[11px] font-black uppercase tracking-widest text-[#11311F] hover:text-[#4A6741] transition-colors"
            >
              {isArabic ? link.ar : link.en}
            </Link>
          ))}
        </div>

        {/* Desktop Left Icons / Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Desktop */}
          <button 
            onClick={toggleLang}
            className="hidden lg:flex items-center gap-2 text-[#6B5E55] hover:text-[#1B2A22] transition-colors text-[10px] font-bold uppercase tracking-widest bg-[#E3E8E1]/50 px-3 py-1.5 rounded-full mr-2"
          >
            <Globe className="w-3.5 h-3.5" />
            {isArabic ? 'EN' : 'العربية'}
          </button>

          <div className="hidden lg:flex items-center">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1B2A22] hover:text-[#4A6741] p-2 transition-colors"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button className="text-[#1B2A22] hover:text-[#4A6741] relative p-2 transition-colors group">
              <Heart className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 bg-[#1B2A22] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {wishlistCount}
              </span>
            </button>
            <button 
              onClick={onOpenCart}
              className="text-[#1B2A22] hover:text-[#4A6741] relative p-2 transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 bg-[#4A6741] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            </button>
          </div>

          <button className="text-[#1B2A22] ml-2 lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 p-4 rounded-full bg-[#F5F2EE] hover:bg-[#1B2A22] hover:text-white transition-all group"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="w-full max-w-2xl space-y-8 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
              <h2 className="text-4xl font-black text-[#1B2A22] tracking-tighter uppercase">
                {isArabic ? 'ابحث عن قهوتك' : 'Search Your Coffee'}
              </h2>
              <div className="relative group">
                <input 
                  type="text" 
                  autoFocus
                  placeholder={isArabic ? 'مثلاً: إسبريسو، بن برازيلي...' : 'Search for products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/products?search=${searchQuery}`)}
                  className="w-full bg-transparent border-b-4 border-[#E8E2D9] focus:border-[#4A6741] py-6 text-3xl font-bold outline-none transition-all placeholder:text-[#8B7E74]/30"
                />
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#4A6741]" />
              </div>
              <p className="text-[#8B7E74] font-bold text-sm">
                {isArabic ? 'اضغط Enter للبحث' : 'Press Enter to Search'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-[#E8E2D9] shadow-xl overflow-hidden"
          >
            <div className="px-6 py-10 flex flex-col gap-8 text-lg font-black text-[#1B2A22]" dir={isArabic ? 'rtl' : 'ltr'}>
              {navLinks.map((link) => (
                <Link 
                  key={link.en} 
                  to={link.href} 
                  onClick={(e: any) => {
                    handleNavClick(e, link.href);
                    setIsOpen(false);
                  }}
                  className="hover:text-[#4A6741] transition-colors border-b border-[#F0EDE8] pb-4"
                >
                  {isArabic ? link.ar : link.en}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

  );
}
