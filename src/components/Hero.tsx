import { motion } from 'motion/react';

const BANNER = 'https://www.image2url.com/r2/default/images/1778936419117-56822186-79ab-40d9-a9f0-679ca18774b5.jpg';

export default function Hero({ isArabic }: { isArabic: boolean }) {
  return (
    <section className="relative h-screen min-h-[700px] w-full flex items-end justify-center overflow-hidden bg-[#1B2A22] pb-32">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={BANNER} 
          alt="Hero Background" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000';
          }}
        />
      </div>

      {/* Subtle overlay to help button visibility */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 text-center px-6 max-w-5xl" dir={isArabic ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#4A6741] hover:bg-[#1B2A22] text-white px-12 py-5 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#4A6741]/20 text-lg uppercase tracking-widest w-full sm:w-auto"
            >
              {isArabic ? 'ابدأ التسوق' : 'Shop Now'}
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-12 py-5 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95 text-lg uppercase tracking-widest w-full sm:w-auto"
            >
              {isArabic ? 'قصتنا' : 'Our Story'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
