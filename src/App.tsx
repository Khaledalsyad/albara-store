import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Truck, ShieldCheck, Star as StarIcon, MessagesSquare } from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from './components/Navbar';
import MobileTabBar from './components/MobileTabBar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AIRecommender from './components/AIRecommender';
import ContactSection from './components/ContactSection';
import ProductDetails from './components/ProductDetails';
import ProductsPage from './components/ProductsPage';
import AdminDashboard from './components/AdminDashboard';
import OrderTracking from './components/OrderTracking';
import { Product, CartItem } from './types';
import { PRODUCTS as STATIC_PRODUCTS } from './data/products';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';

export default function App() {
  const [isArabic, setIsArabic] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [storeSettings, setStoreSettings] = useState({
    announcementAr: '🚚 خصم 10% على أول طلب بكود BARA10 • توليفات بن البراء المميزة • نصلك أينما كنت في القاهرة • استمتع بأجود أنواع القهوة المختصة',
    announcementEn: '🚚 10% OFF ON FIRST ORDER WITH CODE BARA10 • AL-BARAA SPECIAL BLENDS • DELIVERY ACROSS CAIRO • PREMIUM SPECIALTY COFFEE',
    whatsappNumber: '201092680036'
  });

  useEffect(() => {
    // Real-time products from Firestore
    const q = query(collection(db, 'products'), orderBy('id'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setProducts(snapshot.docs.map(doc => doc.data() as Product));
      }
    });

    // Store Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as any;
        setStoreSettings(prev => ({
          ...prev,
          announcementAr: data.announcementAr || prev.announcementAr,
          announcementEn: data.announcementEn || prev.announcementEn,
          whatsappNumber: data.whatsappNumber || prev.whatsappNumber
        }));
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  const toggleLang = () => setIsArabic(!isArabic);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product, weight: string, price: number) => {
    setCart(prev => {
      const cartItemId = `${product.id}-${weight}`;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const wOption = product.weights.find(w => w.value === weight);
      return [...prev, { 
        ...product, 
        cartItemId, 
        quantity: 1, 
        selectedWeight: weight, 
        selectedPrice: price,
        selectedWeightLabelAr: wOption?.labelAr || weight,
        selectedWeightLabelEn: wOption?.labelEn || weight
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <Router>
      <AppContent 
        isArabic={isArabic} toggleLang={toggleLang} cartCount={cartCount} wishlistCount={wishlist.length}
        isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
        storeSettings={storeSettings} cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
        clearCart={clearCart} products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist}
      />
    </Router>
  );
}

function AppContent({ 
  isArabic, toggleLang, cartCount, wishlistCount, isSearchOpen, setIsSearchOpen, isCartOpen, setIsCartOpen,
  storeSettings, cart, updateQuantity, removeFromCart, clearCart, products, addToCart, toggleWishlist, wishlist
}: any) {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <div className={`min-h-screen bg-[#F2F4EF] text-[#1B2A22] font-sans selection:bg-[#4A6741]/20 selection:text-[#4A6741] ${isAdminPage ? '' : 'pb-20 lg:pb-0'}`}>
      {!isAdminPage && (
        <>
          <Navbar 
            cartCount={cartCount} 
            wishlistCount={wishlistCount}
            isArabic={isArabic} 
            toggleLang={toggleLang} 
            onOpenCart={() => setIsCartOpen(true)} 
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
          />
          
          <div className="bg-[#1B2A22] text-[#A3B18A] py-2 overflow-hidden sticky top-0 z-[60] border-b border-white/5 h-8 flex items-center">
            <motion.div 
              animate={{ x: isArabic ? ["100%", "-100%"] : ["-100%", "100%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap flex gap-12 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs min-w-full"
            >
              <span>{isArabic ? storeSettings.announcementAr : storeSettings.announcementEn}</span>
            </motion.div>
          </div>

          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClearCart={clearCart}
            isArabic={isArabic}
          />
        </>
      )}

        <Routes>
          <Route path="/" element={
            <main>
              {/* Rest of the routes */}
              <Hero isArabic={isArabic} />
              
              {/* Features Bar */}
              <section className="bg-white border-b border-[#E8E2D9] py-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                  {[
                    { icon: Truck, tAr: 'توصيل سريع', tEn: 'Fast Delivery', dAr: 'خلال 24-48 ساعة', dEn: 'Within 24-48 hours' },
                    { icon: ShieldCheck, tAr: 'دفع آمن', tEn: 'Secure Payment', dAr: 'تشفير كامل لبياناتك', dEn: 'Fully encrypted data' },
                    { icon: StarIcon, tAr: 'جودة مضمونة', tEn: 'Guaranteed Quality', dAr: 'أجود أنواع البن المختص', dEn: 'Premium specialty beans' },
                    { icon: MessagesSquare, tAr: 'دعم فني', tEn: 'Support', dAr: 'متواجدون لخدمتكم 24/7', dEn: 'Here for you 24/7' },
                  ].map((f, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-4 group" dir={isArabic ? 'rtl' : 'ltr'}>
                      <div className="w-16 h-16 bg-[#F5F2EE] rounded-2xl flex items-center justify-center border border-[#E8E2D9] group-hover:bg-[#1B2A22] group-hover:border-[#1B2A22] transition-all duration-300">
                        <f.icon className="w-6 h-6 text-[#4A6741] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#1B2A22] uppercase tracking-widest mb-1">{isArabic ? f.tAr : f.tEn}</h4>
                        <p className="text-[11px] text-[#8B7E74] font-bold opacity-70 leading-tight">{isArabic ? f.dAr : f.dEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <ProductGrid 
                products={products} 
                isArabic={isArabic} 
                onAddToCart={addToCart} 
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
              
              {/* About Section */}
              <section id="about" className="py-24 px-6 border-y border-[#E8E2D9] bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                  <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                      src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1000" 
                      alt="Roasting process"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#C49B66]/10 mix-blend-multiply" />
                  </div>
                  
                  <div dir={isArabic ? 'rtl' : 'ltr'}>
                    <span className="text-[#4A6741] font-bold tracking-[0.2em] uppercase text-xs">
                      {isArabic ? 'حكاية البراء' : 'The Al-Baraa Story'}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black mt-4 mb-4 tracking-tighter text-[#1B2A22]">
                      {isArabic ? 'شغف، ابتكار، وأصالة' : 'Passion, Innovation & Origin'}
                    </h2>
                    <p className="text-[#6B5E55] leading-relaxed text-lg mb-8 font-medium italic">
                      {isArabic 
                        ? 'البراء هي مساحة تمنحك الهدوء مع كل رشفة. نختار محاصيلنا بعناية من مزارع تحترم الطبيعة والإنسان، لنصنع لك قهوة تليق بذائقتك الرفيعة.'
                        : 'Al-Baraa is a space that gives you tranquility with every sip. We select our crops carefully from farms that respect nature and humans, to craft coffee that fits your fine taste.'}
                    </p>
                    <div className="grid grid-cols-2 gap-12 border-t border-[#E8E2D9] pt-10 mt-10">
                      <div>
                        <div className="text-4xl font-bold text-[#1B2A22] mb-2">12+</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#4A6741]">{isArabic ? 'محصول مختص' : 'Specialty Crops'}</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-[#1B2A22] mb-2">100%</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#4A6741]">{isArabic ? 'حبوب طازجة' : 'Fresh Beans'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <ContactSection isArabic={isArabic} />
              <AIRecommender isArabic={isArabic} />
            </main>
          } />
          <Route path="/product/:id" element={
            <ProductDetails 
              isArabic={isArabic} 
              products={products} 
              onAddToCart={addToCart} 
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
          <Route path="/products" element={
            <ProductsPage 
              products={products} 
              isArabic={isArabic} 
              onAddToCart={addToCart} 
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
          <Route path="/admin" element={
            <AdminDashboard isArabic={isArabic} />
          } />
          <Route path="/track" element={
            <OrderTracking isArabic={isArabic} />
          } />
        </Routes>

      {!isAdminPage && (
        <>
          <footer className="py-24 px-6 bg-[#1B2A22] text-white">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              <Link to="/" className="flex flex-col items-center mb-12 group transition-transform hover:scale-105">
                <div className="flex flex-col items-center leading-[0.8]">
                  <span className="text-5xl lg:text-6xl font-black text-[#A3B18A] tracking-tighter">البراء</span>
                  <span className="text-[12px] lg:text-[14px] font-black tracking-[0.8em] text-white/40 uppercase translate-y-3 block pr-2">AL-BARAA</span>
                </div>
              </Link>
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12 text-center md:text-right" dir={isArabic ? 'rtl' : 'ltr'}>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest font-black text-white/40">{isArabic ? 'الموقع' : 'Location'}</div>
                  <div className="text-sm font-bold">{isArabic ? 'القاهرة - شبرا الخيمة' : 'Cairo - Shubra El-Kheima'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest font-black text-white/40">{isArabic ? 'واتساب' : 'WhatsApp'}</div>
                  <div className="text-sm font-bold">01092680036</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest font-black text-white/40">{isArabic ? 'ساعات العمل' : 'Working Hours'}</div>
                  <div className="text-sm font-bold">{isArabic ? '9 ص - 10 م' : '9 AM - 10 PM'}</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-10 mb-12 text-[11px] uppercase tracking-[0.3em] font-bold border-t border-white/5 pt-12 w-full">
                <Link to="/" className="hover:text-[#A3B18A] transition-colors">{isArabic ? 'الرئيسية' : 'Home'}</Link>
                <a href="#products" className="hover:text-[#A3B18A] transition-colors">{isArabic ? 'المتجر' : 'Shop'}</a>
                <a href="#about" className="hover:text-[#A3B18A] transition-colors">{isArabic ? 'قصتنا' : 'Our Story'}</a>
                <a href="#contact" className="hover:text-[#A3B18A] transition-colors">{isArabic ? 'اتصل بنا' : 'Contact'}</a>
              </div>
              <div className="flex gap-4 mb-10 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {['Mada', 'Visa', 'MasterCard', 'Cash'].map(p => (
                  <div key={p} className="bg-white/10 px-3 py-1 rounded-md text-[10px] font-bold tracking-tighter uppercase">{p === 'Cash' && isArabic ? 'كاش' : p}</div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} AL-BARAA ROASTERY. ALL RIGHTS RESERVED.</p>
            </div>
          </footer>
          <MobileTabBar isArabic={isArabic} cartCount={cartCount} wishlistCount={wishlistCount} onOpenCart={() => setIsCartOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} />
        </>
      )}
    </div>
  );
}
