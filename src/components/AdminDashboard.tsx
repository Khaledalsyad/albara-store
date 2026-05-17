import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Plus, Edit2, Trash2, CheckCircle, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

import { Product, WeightOption } from '../types';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

interface AdminDashboardProps {
  isArabic: boolean;
}

export default function AdminDashboard({ isArabic }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('baraa_admin_session') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: '', nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', category: 'قهوة تركي', image: '', basePrice: 0,
    weights: [
      { id: '125g', labelAr: '125 جرام', labelEn: '125g', price: 0 },
      { id: '250g', labelAr: '250 جرام', labelEn: '250g', price: 0 },
      { id: '500g', labelAr: '500 جرام', labelEn: '500g', price: 0 }
    ]
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState({
    announcementAr: '🚚 خصم 10% على أول طلب بكود BARA10',
    announcementEn: '🚚 10% OFF ON FIRST ORDER WITH CODE BARA10',
    whatsappNumber: '201092680036'
  });

  useEffect(() => {
    // Real-time products
    const qProducts = query(collection(db, 'products'), orderBy('id'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });

    // Real-time orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });

    // Real-time settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setStoreSettings(doc.data() as any);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeSettings();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'baraa2026') {
      setIsLoggedIn(true);
      localStorage.setItem('baraa_admin_session', 'true');
    } else {
      alert(isArabic ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('baraa_admin_session');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = editingProduct?.id || productForm.id || `PROD-${Date.now()}`;
      const finalData = { ...productForm, id };
      await setDoc(doc(db, 'products', id), finalData);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        id: '', nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', category: 'قهوة تركي', image: '', basePrice: 0,
        weights: [
          { id: '125g', labelAr: '125 جرام', labelEn: '125g', price: 0 },
          { id: '250g', labelAr: '250 جرام', labelEn: '250g', price: 0 },
          { id: '500g', labelAr: '500 جرام', labelEn: '500g', price: 0 }
        ]
      });
      alert(isArabic ? 'تم حفظ المنتج بنجاح' : 'Product saved successfully');
    } catch (e) {
      console.error("Error saving product:", e);
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsProductModalOpen(true);
  };

  const handleSync = async () => {
    if (!confirm(isArabic ? 'هل تريد استيراد جميع المنتجات من القائمة الأصلية؟' : 'Import all products from original menu?')) return;
    setIsSyncing(true);
    try {
      for (const product of STATIC_PRODUCTS) {
        await setDoc(doc(db, 'products', product.id), product);
      }
      alert(isArabic ? 'تم مزامنة المنتجات بنجاح' : 'Products synced successfully');
    } catch (e) {
      console.error("Sync error:", e);
      alert(isArabic ? 'حدث خطأ أثناء المزامنة' : 'Error during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4EF] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#E8E2D9] max-w-md w-full"
        >
          <div className="w-20 h-20 bg-[#1B2A22] rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Settings className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black mb-8 tracking-tight text-center">
            {isArabic ? 'لوحة تحكم بن البراء' : 'Al-Baraa Admin'}
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8B7E74] mb-2 px-2">
                {isArabic ? 'اسم المستخدم' : 'Username'}
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#F2F4EF] border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#1B2A22] outline-none"
                placeholder={isArabic ? 'ادخل اسم المستخدم' : 'Enter username'}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8B7E74] mb-2 px-2">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F2F4EF] border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#1B2A22] outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#1B2A22] text-white py-5 rounded-2xl font-bold hover:bg-[#2C3E33] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#1B2A22]/20"
            >
              <LogIn className="w-5 h-5" />
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4EF] flex" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B2A22] text-white p-8 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#1B2A22]" />
          </div>
          <span className="font-black tracking-tight">{isArabic ? 'بن البراء' : 'Al-Baraa'}</span>
        </div>

        <div className="mb-10 flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-[#A3B18A]/20 flex items-center justify-center font-black text-[#A3B18A]">AD</div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate">Admin Manager</div>
            <div className="text-[10px] opacity-50 truncate">admin@albaraa.co</div>
          </div>
        </div>

        <nav className="space-y-4 flex-1">
          {[
            { id: 'products', icon: ShoppingBag, labelAr: 'المنتجات', labelEn: 'Products' },
            { id: 'orders', icon: CheckCircle, labelAr: 'الطلبات', labelEn: 'Orders' },
            { id: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                activeTab === item.id ? 'bg-[#A3B18A] text-[#1B2A22]' : 'hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isArabic ? item.labelAr : item.labelEn}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-red-500/10 text-red-400 font-bold transition-all"
        >
          <LogOut className="w-5 h-5" />
          {isArabic ? 'خروج' : 'Logout'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto pb-32 lg:pb-12">
        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex bg-white rounded-2xl p-2 mb-8 border border-[#E8E2D9] shadow-sm">
          {[
            { id: 'products', icon: ShoppingBag, labelAr: 'المنتجات', labelEn: 'Products' },
            { id: 'orders', icon: CheckCircle, labelAr: 'الطلبات', labelEn: 'Orders' },
            { id: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-tighter ${
                activeTab === item.id ? 'bg-[#1B2A22] text-white' : 'text-[#8B7E74]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isArabic ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-[#1B2A22]">
              {activeTab === 'products' ? (isArabic ? 'إدارة المنتجات' : 'Products Management') :
               activeTab === 'orders' ? (isArabic ? 'الطلبات الواردة' : 'Incoming Orders') :
               (isArabic ? 'إعدادات المتجر' : 'Store Settings')}
            </h1>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={handleLogout}
              className="lg:hidden bg-red-50 text-red-500 p-4 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden xs:inline">{isArabic ? 'خروج' : 'Logout'}</span>
            </button>
            {activeTab === 'products' && (
              <div className="flex gap-4 flex-1 sm:flex-none">
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none bg-white border-2 border-[#1B2A22] text-[#1B2A22] px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {isSyncing ? (isArabic ? 'جاري المزامنة...' : 'Syncing...') : (isArabic ? 'مزامنة القائمة' : 'Sync Menu')}
                </button>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none bg-[#1B2A22] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#1B2A22]/20"
                >
                  <Plus className="w-5 h-5" />
                  {isArabic ? 'إضافة منتج' : 'Add Product'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-[#1B2A22]/80 backdrop-blur-sm"
              onClick={() => setIsProductModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-screen"
            >
              <div className="p-8 border-b border-[#E8E2D9] flex justify-between items-center bg-[#F2F4EF]/50">
                <h2 className="text-2xl font-black text-[#1B2A22]">
                  {editingProduct ? (isArabic ? 'تعديل المنتج' : 'Edit Product') : (isArabic ? 'إضافة منتج جديد' : 'New Product')}
                </h2>
                <button onClick={() => setIsProductModalOpen(false)} className="bg-[#1B2A22] text-white rounded-full p-2">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'الاسم بالعربي' : 'Name (Arabic)'}</label>
                    <input required type="text" value={productForm.nameAr} onChange={e => setProductForm({...productForm, nameAr: e.target.value})} className="w-full bg-[#F2F4EF] rounded-2xl p-4 font-bold border-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'الاسم بالإنجليزي' : 'Name (English)'}</label>
                    <input required type="text" value={productForm.nameEn} onChange={e => setProductForm({...productForm, nameEn: e.target.value})} className="w-full bg-[#F2F4EF] rounded-2xl p-4 font-bold border-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'التصنيف' : 'Category'}</label>
                    <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as any})} className="w-full bg-[#F2F4EF] rounded-2xl p-4 font-bold border-none appearance-none">
                      <option value="قهوة تركي">قهوة تركي / Turkish</option>
                      <option value="قهوة نكهات">قهوة نكهات / Flavored</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'السعر الأساسي' : 'Base Price'}</label>
                    <input required type="number" value={productForm.basePrice} onChange={e => setProductForm({...productForm, basePrice: Number(e.target.value)})} className="w-full bg-[#F2F4EF] rounded-2xl p-4 font-bold border-none" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'رابط الصورة' : 'Image URL'}</label>
                    <input 
                      required 
                      type="text" 
                      value={productForm.image} 
                      onChange={e => setProductForm({...productForm, image: e.target.value})} 
                      className="w-full bg-[#F2F4EF] rounded-2xl p-4 font-bold border-none" 
                      placeholder="https://..." 
                    />
                    {productForm.image && (
                      <div className="mt-4 p-4 bg-[#F2F4EF] rounded-3xl border-2 border-dashed border-[#E8E2D9]">
                        <p className="text-[10px] font-black uppercase mb-2 opacity-50">{isArabic ? 'معاينة الصورة' : 'Image Preview'}</p>
                        <img 
                          src={productForm.image} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-2xl"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+URL')}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 px-2">{isArabic ? 'أسعار الأوزان (اختياري)' : 'Weight Prices'}</label>
                    {productForm.weights?.map((w, idx) => (
                      <div key={w.id} className="flex gap-2 mb-2 items-center">
                        <span className="text-[10px] w-12 font-black">{isArabic ? w.labelAr : w.labelEn}</span>
                        <input type="number" value={w.price} onChange={e => {
                          const newWeights = [...(productForm.weights || [])];
                          newWeights[idx].price = Number(e.target.value);
                          setProductForm({...productForm, weights: newWeights});
                        }} className="flex-1 bg-[#F2F4EF] rounded-xl p-2 text-sm border-none" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-[#1B2A22] text-white py-5 rounded-2xl font-black text-lg mt-8 hover:bg-[#2C3E33] transition-all">
                    {isArabic ? 'حفظ المنتج' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] p-8 border border-[#E8E2D9] shadow-sm min-h-[600px]">
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir={isArabic ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="border-b border-[#E8E2D9] text-[#8B7E74] text-xs uppercase font-black">
                    <th className="pb-6 px-4">{isArabic ? 'المنتج' : 'Product'}</th>
                    <th className="pb-6 px-4 text-center">{isArabic ? 'السعر' : 'Price'}</th>
                    <th className="pb-6 px-4 text-left">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/50">
                  {products.map((product) => (
                    <tr key={product.id} className="group hover:bg-[#F2F4EF]/50 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-4">
                          <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D9]" />
                          <div>
                            <div className="font-bold">{isArabic ? product.nameAr : product.nameEn}</div>
                            <div className="text-[10px] text-[#8B7E74]">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center font-bold">{product.basePrice} {isArabic ? 'ج.م' : 'EGP'}</td>
                      <td className="py-6 px-4 text-left">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEdit(product)}
                            className="p-2 hover:bg-[#1B2A22] hover:text-white rounded-lg transition-all text-[#8B7E74]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
                                await deleteDoc(doc(db, 'products', product.firebaseId));
                              }
                            }}
                            className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[#8B7E74]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-20 text-center text-[#8B7E74] font-bold">
                        {isArabic ? 'لا توجد منتجات مسجلة' : 'No products found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.firebaseId} className="p-8 bg-[#F2F4EF]/30 rounded-[2.5rem] border border-[#E8E2D9] group hover:border-[#1B2A22] transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74] mb-1">
                        {isArabic ? 'صاحب الطلب' : 'Customer'}
                      </div>
                      <div className="font-black text-2xl text-[#1B2A22]">{order.customerName}</div>
                      <div className="text-sm text-[#4A6741] font-bold mt-1">{order.customerPhone}</div>
                      <div className="text-xs text-[#8B7E74] mt-2 font-medium max-w-xs">{order.customerAddress}</div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                      <select 
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await updateDoc(doc(db, 'orders', order.firebaseId), { status: newStatus });
                        }}
                        className="w-full md:w-48 bg-[#1B2A22] text-white px-4 py-3 rounded-xl font-bold border-none appearance-none outline-none cursor-pointer"
                      >
                        <option value="pending">{isArabic ? '⏳ قيد المراجعة' : 'Pending'}</option>
                        <option value="processing">{isArabic ? '⚙️ جاري التحضير' : 'Processing'}</option>
                        <option value="shipped">{isArabic ? '🚚 تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{isArabic ? '✅ تم التوصيل' : 'Delivered'}</option>
                        <option value="cancelled">{isArabic ? '❌ ملغي' : 'Cancelled'}</option>
                      </select>
                      <div className="text-[10px] font-black text-[#8B7E74] uppercase tracking-tighter">
                        {new Date(order.createdAt).toLocaleString(isArabic ? 'ar' : 'en-US')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-white/50 p-6 rounded-2xl border border-[#E8E2D9]">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#1B2A22]">{item.quantity}x</span>
                          <span className="font-bold">{isArabic ? item.nameAr : item.nameEn}</span>
                          <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-[#E8E2D9] font-black text-[#8B7E74]">
                            {isArabic ? item.selectedWeightLabelAr : item.selectedWeightLabelEn}
                          </span>
                        </div>
                        <span className="font-black text-[#4A6741]">{item.selectedPrice * item.quantity} EGP</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74]">#{order.orderId || order.firebaseId.substr(0,8)}</div>
                    <div className="text-2xl font-black text-[#1B2A22] italic serif">{order.total} EGP</div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-20 text-[#8B7E74] font-bold">
                  {isArabic ? 'لا توجد طلبات واردة' : 'No incoming orders'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-8">
              <div>
                <label className="block text-sm font-black mb-2">{isArabic ? 'الإعلان (عربي)' : 'Announcement (Arabic)'}</label>
                <input 
                  type="text" 
                  value={storeSettings.announcementAr}
                  onChange={(e) => setStoreSettings({...storeSettings, announcementAr: e.target.value})}
                  className="w-full p-4 rounded-xl border border-[#E8E2D9] focus:ring-2 focus:ring-[#1B2A22] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-black mb-2">{isArabic ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
                <input 
                  type="text" 
                  value={storeSettings.whatsappNumber}
                  onChange={(e) => setStoreSettings({...storeSettings, whatsappNumber: e.target.value})}
                  className="w-full p-4 rounded-xl border border-[#E8E2D9] focus:ring-2 focus:ring-[#1B2A22] outline-none"
                />
              </div>
              <button 
                onClick={async () => {
                  await setDoc(doc(db, 'settings', 'general'), storeSettings);
                  alert(isArabic ? 'تم الحفظ بنجاح' : 'Saved successfully');
                }}
                className="bg-[#1B2A22] text-white px-10 py-5 rounded-2xl font-bold"
              >
                {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}