import React, { useState } from 'react';
import { Mail, MapPin, Send, Loader2, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactSection({ isArabic }: { isArabic: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const whatsappNumber = "01092680036";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <section id="contact" className="py-24 px-6 bg-[#F2F4EF]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="space-y-12">
            <div>
              <span className="text-[#4A6741] font-bold tracking-[0.2em] uppercase text-xs">
                {isArabic ? 'تواصل معنا' : 'Get in Touch'}
              </span>
              <h2 className="text-4xl md:text-6xl font-black mt-4 mb-8 tracking-tighter italic serif text-[#1B2A22]">
                {isArabic ? 'نحن دائماً بالقرب منك' : 'We are Always Near'}
              </h2>
              <p className="text-[#6B5E55] mb-12 text-lg font-medium leading-relaxed max-w-lg">
                {isArabic 
                  ? 'سواء كنت ترغب في الطلب أو الاستفسار عن أنواع البن وتوليفاتنا الخاصة، فريق بن البراء متاح لخدمتك.'
                  : 'Whether you want to order or inquire about coffee types and our special blends, the Al-Baraa team is available to serve you.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { 
                  icon: MessageSquare, 
                  title: isArabic ? 'واتساب' : 'WhatsApp', 
                  value: whatsappNumber,
                  action: () => window.open(whatsappUrl, '_blank')
                },
                { 
                  icon: Clock, 
                  title: isArabic ? 'ساعات العمل' : 'Working Hours', 
                  value: isArabic ? 'السبت - الخميس | 9 ص - 10 م' : 'Sat - Thu | 9 AM - 10 PM' 
                },
                { 
                  icon: Mail, 
                  title: isArabic ? 'البريد الإلكتروني' : 'Email', 
                  value: isArabic ? 'سيتم الإضافة قريباً' : 'Coming soon' 
                },
                { 
                  icon: MapPin, 
                  title: isArabic ? 'الموقع' : 'Location', 
                  value: isArabic ? 'القاهرة - شبرا الخيمة' : 'Cairo - Shubra El-Kheima' 
                },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={item.action}
                  className={`flex gap-4 items-start p-4 rounded-3xl border border-[#E8E2D9] bg-white hover:border-[#4A6741] transition-all group ${item.action ? 'cursor-pointer hover:shadow-xl hover:shadow-[#4A6741]/5' : ''}`}
                >
                  <div className="w-12 h-12 bg-[#FAF9F6] rounded-2xl flex items-center justify-center border border-[#E8E2D9] group-hover:bg-[#4A6741] transition-colors">
                    <item.icon className="w-5 h-5 text-[#4A6741] group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#8B7E74] mb-1">{item.title}</div>
                    <div className="text-[#1B2A22] font-bold text-sm leading-tight">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-[#25D366]/20 group active:scale-95"
              >
                <MessageSquare className="w-6 h-6 fill-white" />
                <span className="uppercase tracking-widest text-sm">
                  {isArabic ? 'تحدث معنا مباشرة' : 'Chat with us Now'}
                </span>
              </a>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2.5rem] border border-[#E8E2D9] shadow-2xl shadow-[#3D3028]/5"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8B7E74] px-2">{isArabic ? 'الاسم' : 'Name'}</label>
                  <input type="text" className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl p-4 focus:outline-none focus:border-[#4A6741] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8B7E74] px-2">{isArabic ? 'البريد' : 'Email'}</label>
                  <input type="email" className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl p-4 focus:outline-none focus:border-[#4A6741] transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8B7E74] px-2">{isArabic ? 'الرسالة' : 'Message'}</label>
                <textarea className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl p-4 h-32 focus:outline-none focus:border-[#4A6741] transition-colors resize-none" />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B2A22] hover:bg-[#0F1813] text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isArabic ? 'إرسال الرسالة' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
