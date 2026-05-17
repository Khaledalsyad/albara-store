import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function OrderTracking({ isArabic }: { isArabic: boolean }) {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setSearched(true);

    try {
      const q = query(
        collection(db, 'orders'), 
        where('customerPhone', '==', phone),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error tracking orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: any = {
    'pending': { 
      labelAr: 'قيد المراجعة', labelEn: 'Pending', 
      icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' 
    },
    'processing': { 
      labelAr: 'جاري التحضير', labelEn: 'Processing', 
      icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' 
    },
    'shipped': { 
      labelAr: 'تم الشحن', labelEn: 'Shipped', 
      icon: Truck, color: 'text-[#4A6741]', bg: 'bg-[#4A6741]/10' 
    },
    'delivered': { 
      labelAr: 'تم التوصيل', labelEn: 'Delivered', 
      icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' 
    },
    'cancelled': { 
      labelAr: 'ملغي', labelEn: 'Cancelled', 
      icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' 
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4EF] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-black text-[#1B2A22] italic serif tracking-tighter mb-4">
            {isArabic ? 'تتبع طلبك' : 'Track Your Order'}
          </h1>
          <p className="text-[#8B7E74] font-medium max-w-md mx-auto leading-relaxed">
            {isArabic 
              ? 'أدخل رقم الهاتف المستخدم في الطلب لمتابعة حالة شحنتك لحظة بلحظة.' 
              : 'Enter the phone number used in the order to follow your shipment status step by step.'}
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleTrack}
          className="relative mb-16 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-[#8B7E74] w-5 h-5" />
            <input 
              type="tel" 
              placeholder={isArabic ? 'رقم الهاتف (مثال: 010xxxxxxxx)' : 'Phone Number (e.g. 010xxxxxxxx)'}
              className="w-full bg-white border-2 border-[#E8E2D9] rounded-2xl py-5 px-14 font-bold text-lg outline-none focus:border-[#4A6741] transition-all shadow-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#1B2A22] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#2C3E33] transition-all shadow-xl shadow-[#1B2A22]/20 disabled:opacity-50"
          >
            {loading ? (isArabic ? 'جاري البحث...' : 'Searching...') : (isArabic ? 'بحث عن الطلبات' : 'Search Orders')}
          </button>
        </motion.form>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex justify-center py-20"
               >
                 <div className="w-10 h-10 border-4 border-[#1B2A22] border-t-transparent rounded-full animate-spin" />
               </motion.div>
            ) : orders.length > 0 ? (
              <div className="grid gap-6">
                {orders.map((order, idx) => {
                  const status = statusMap[order.status] || statusMap['pending'];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2.5rem] p-8 border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                        <div className="flex items-start gap-4">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", status.bg)}>
                            <StatusIcon className={cn("w-7 h-7", status.color)} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74] mb-1">
                              {isArabic ? 'رقم الطلب' : 'Order ID'}
                            </div>
                            <h3 className="text-2xl font-black text-[#1B2A22]">#{order.orderId}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end">
                          <div className={cn("px-4 py-2 rounded-full font-black text-sm uppercase flex items-center gap-2", status.bg, status.color)}>
                            <StatusIcon className="w-4 h-4" />
                            {isArabic ? status.labelAr : status.labelEn}
                          </div>
                          <div className="mt-2 text-xs font-bold text-[#8B7E74]">
                            {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8 border-t border-[#F2F4EF] pt-8">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-[#F2F4EF]/50 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-xs border border-[#E8E2D9]">{item.quantity}x</span>
                              <span className="font-bold text-[#1B2A22]">{isArabic ? item.nameAr : item.nameEn}</span>
                              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E8E2D9] font-black text-[#8B7E74]">
                                {isArabic ? item.selectedWeightLabelAr : item.selectedWeightLabelEn}
                              </span>
                            </div>
                            <span className="font-bold text-[#4A6741]">{item.selectedPrice * item.quantity} EGP</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-end border-t border-[#F2F4EF] pt-6">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74]">{isArabic ? 'العنوان' : 'Delivery Address'}</div>
                          <div className="font-bold text-sm text-[#1B2A22]">{order.customerAddress}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74]">{isArabic ? 'الإجمالي' : 'Total Amount'}</div>
                          <div className="text-2xl font-black text-[#1B2A22]">{order.total} EGP</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : searched ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#E8E2D9]"
              >
                <div className="w-16 h-16 bg-[#F2F4EF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-[#8B7E74]" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2A22] mb-2">{isArabic ? 'لا توجد طلبات بهذا الرقم' : 'No orders found for this number'}</h3>
                <p className="text-[#8B7E74]">{isArabic ? 'يرجى التأكد من كتابة الرقم بشكل صحيح' : 'Please make sure you entered the correct number'}</p>
              </motion.div>
            ) : (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                 <Package className="w-20 h-20 mb-4" />
                 <p className="text-lg font-bold italic serif uppercase tracking-[0.2em]">{isArabic ? 'في انتظار رقم هاتفك...' : 'Waiting for your digits...'}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
