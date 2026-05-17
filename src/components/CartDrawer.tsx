import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle2, MapPin, Phone, User } from 'lucide-react';
import { CartItem } from '../types';
import { cn } from '../lib/utils';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onClearCart,
  isArabic
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[]; 
  onUpdateQuantity: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  isArabic: boolean;
}) {
  const [step, setStep] = useState<'cart' | 'info' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce((acc, item) => acc + item.selectedPrice * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsSubmitting(true);

    const generatedId = `BR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const orderData = {
      orderId: generatedId,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      items: items.map(item => ({
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        quantity: item.quantity,
        selectedWeight: item.selectedWeight,
        selectedPrice: item.selectedPrice,
        selectedWeightLabelAr: item.selectedWeightLabelAr,
        selectedWeightLabelEn: item.selectedWeightLabelEn
      })),
      total: total + 50,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const { db } = await import('../lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderId(generatedId);
      setStep('success');
      onClearCart();
      
      // Optional: WhatsApp as a backup notification
      let message = isArabic 
        ? `طلب جديد رقم #${generatedId}\nالاسم: ${customerInfo.name}\nالعنوان: ${customerInfo.address}\n\n` 
        : `New Order #${generatedId}\nName: ${customerInfo.name}\nAddress: ${customerInfo.address}\n\n`;
      
      items.forEach(item => {
        message += `• ${isArabic ? item.nameAr : item.nameEn} x ${item.quantity}\n`;
      });
      message += `\n${isArabic ? 'الإجمالي' : 'Total'}: ${total + 50} EGP`;
      
      // Clear form
      setCustomerInfo({ name: '', phone: '', address: '' });
    } catch (e) {
      console.error("Error saving order:", e);
      alert(isArabic ? 'حدث خطأ أثناء إتمام الطلب' : 'Error processing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDrawer = () => {
    setStep('cart');
    onClose();
  };

  return (
    <AnimatePresence onExitComplete={() => setStep('cart')}>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: isArabic ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '-100%' : '100%' }}
            className={cn(
              "fixed top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col",
              isArabic ? "left-0" : "right-0"
            )}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="p-8 border-b border-[#E8E2D9] flex justify-between items-center bg-[#FAF9F6]">
              <h2 className="text-2xl font-black italic serif tracking-tighter text-[#3D3028]">
                {step === 'cart' ? (isArabic ? 'سلة التسوق' : 'Shopping Bag') :
                 step === 'info' ? (isArabic ? 'بيانات التوصيل' : 'Delivery Details') :
                 (isArabic ? 'تم الطلب بنجاح' : 'Success')}
              </h2>
              <button onClick={resetDrawer} className="p-2 hover:bg-[#E8E2D9] rounded-full outline-none transition-colors text-[#3D3028]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {step === 'cart' && (
                <div className="space-y-8">
                  {items.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[#2C2420]/20 gap-4">
                      <ShoppingBag className="w-20 h-20 opacity-10" />
                      <p className="text-xl font-medium italic serif">{isArabic ? 'السلة هادئة جداً...' : 'Your bag is too quiet...'}</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.cartItemId} className="flex gap-6 group">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F5F2EE] flex-shrink-0 border border-[#E8E2D9]">
                          <img src={item.image} alt={item.nameEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-[#3D3028] leading-tight text-lg italic serif">
                                {isArabic ? item.nameAr : item.nameEn}
                            </h4>
                            <button onClick={() => onRemove(item.cartItemId)} className="text-[#8B7E74] hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-[#C49B66] font-mono font-bold">{item.selectedPrice} {isArabic ? 'ج.م' : 'EGP'}</p>
                            <span className="text-[9px] font-black uppercase bg-[#F5F2EE] text-[#8B7E74] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                              {isArabic ? item.selectedWeightLabelAr : item.selectedWeightLabelEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-3 bg-[#F5F2EE] px-3 py-1.5 rounded-full border border-[#E8E2D9]">
                              <button 
                                onClick={() => onUpdateQuantity(item.cartItemId, Math.max(0, item.quantity - 1))}
                                className="p-1 hover:text-[#C49B66] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold min-w-[1rem] text-center text-[#3D3028]">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1 hover:text-[#C49B66] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {step === 'info' && (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                  <div className="p-6 bg-[#F2F4EF] rounded-[2rem] border border-[#E8E2D9]">
                    <div className="flex items-center gap-3 mb-6 text-[#4A6741]">
                      <User className="w-5 h-5" />
                      <span className="font-black italic serif">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</span>
                    </div>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white border-none rounded-xl p-4 font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#4A6741]/20"
                      placeholder={isArabic ? 'ادخل اسمك' : 'Enter your name'}
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>

                  <div className="p-6 bg-[#F2F4EF] rounded-[2rem] border border-[#E8E2D9]">
                    <div className="flex items-center gap-3 mb-6 text-[#4A6741]">
                      <Phone className="w-5 h-5" />
                      <span className="font-black italic serif">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</span>
                    </div>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-white border-none rounded-xl p-4 font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#4A6741]/20"
                      placeholder="01xxxxxxxxx"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>

                  <div className="p-6 bg-[#F2F4EF] rounded-[2rem] border border-[#E8E2D9]">
                    <div className="flex items-center gap-3 mb-6 text-[#4A6741]">
                      <MapPin className="w-5 h-5" />
                      <span className="font-black italic serif">{isArabic ? 'عنوان التوصيل' : 'Delivery Address'}</span>
                    </div>
                    <textarea 
                      required
                      className="w-full bg-white border-none rounded-xl p-4 font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#4A6741]/20 min-h-[100px]"
                      placeholder={isArabic ? 'المدينة، المنطقة، الشارع...' : 'City, Area, Street...'}
                      value={customerInfo.address}
                      onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                    />
                  </div>
                </form>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-24 h-24 bg-[#4A6741]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-[#4A6741]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic serif text-[#1B2A22] mb-2">{isArabic ? 'شكراً لثقتك بنا!' : 'Thank you for your trust!'}</h3>
                    <p className="text-[#8B7E74] font-medium leading-relaxed">{isArabic ? 'تم استلام طلبك وهو الآن قيد المراجعة.' : 'Your order has been received and is being reviewed.'}</p>
                  </div>
                  <div className="w-full p-6 bg-[#F2F4EF] rounded-[2rem] border border-[#E8E2D9]">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#8B7E74] mb-2">{isArabic ? 'رقم الطلب' : 'Order ID'}</p>
                    <div className="text-2xl font-black text-[#1B2A22] tracking-tighter">#{orderId}</div>
                  </div>
                  <p className="text-xs text-[#8B7E74] italic">{isArabic ? '* يمكنك تتبع حالة طلبك من خلال رقم الهاتف في أي وقت' : '* You can track your order status using your phone number anytime'}</p>
                  <button 
                    onClick={resetDrawer}
                    className="w-full bg-[#1B2A22] text-white py-4 rounded-2xl font-bold mt-4"
                  >
                    {isArabic ? 'العودة للتسوق' : 'Back to Shopping'}
                  </button>
                </div>
              )}
            </div>

            {step !== 'success' && (
              <div className="p-8 border-t border-[#E8E2D9] bg-[#FAF9F6] space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#8B7E74] font-bold">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="text-[#3D3028] font-black">{total} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#8B7E74] font-bold">{isArabic ? 'رسوم التوصيل' : 'Shipping Fee'}</span>
                    <span className="text-[#3D3028] font-black">50 {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <div className="pt-3 border-t border-[#E8E2D9] flex justify-between items-end">
                    <span className="text-[#3D3028] text-xs font-black uppercase tracking-widest">{isArabic ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-3xl font-black text-[#4A6741] italic serif tracking-tighter">
                      {total + (items.length > 0 ? 50 : 0)} <span className="text-sm font-normal not-italic">{isArabic ? 'ج.م' : 'EGP'}</span>
                    </span>
                  </div>
                </div>
                
                {step === 'cart' ? (
                  <button 
                    onClick={() => setStep('info')}
                    disabled={items.length === 0}
                    className="w-full bg-[#3D3028] hover:bg-[#2C2420] disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-[1.5rem] font-bold transition-all shadow-2xl shadow-[#3D3028]/20 active:scale-[0.98] text-sm uppercase tracking-[0.2em] mt-2"
                  >
                    {isArabic ? 'الذهاب لبيانات التوصيل' : 'Proceed to Delivery Info'}
                  </button>
                ) : (
                  <button 
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4A6741] hover:bg-[#385131] disabled:opacity-50 text-white py-5 rounded-[1.5rem] font-bold transition-all shadow-2xl shadow-[#4A6741]/20 active:scale-[0.98] text-sm uppercase tracking-[0.2em] mt-2"
                  >
                    {isSubmitting ? (isArabic ? 'جاري الطلب...' : 'Ordering...') : (isArabic ? 'تأكيد الطلب الآن' : 'Confirm Order Now')}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
