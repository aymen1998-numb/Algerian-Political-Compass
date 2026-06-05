import React, { memo } from 'react';
import { motion } from 'motion/react';
import { HeartHandshake } from 'lucide-react';

interface ContactInfoScreenProps {
  contactInfo: string;
  setContactInfo: (val: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export const ContactInfoScreen: React.FC<ContactInfoScreenProps> = memo(({
  contactInfo,
  setContactInfo,
  onSubmit,
  onSkip
}) => {
  return (
    <motion.div
      key="contact_info"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 max-w-md mx-auto text-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform rotate-12 text-indigo-500">
         <HeartHandshake className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-500/20 rounded-full">
             <HeartHandshake className="w-12 h-12 text-indigo-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-4">اكتمل الاختبار! 🎉</h2>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          وشكراً على مشاركتك! قبل ما تشوف النتيجة ديالك وتفوت للاختبار الثاني، إذا حبيت نتواصلو معاك ولا تشاركنا رأيك، تقدر تخلي الرابط تاع حسابك (انستغرام/فيسبوك) ولا رقم هاتفك.
        </p>

        <div className="space-y-4 text-right mb-6">
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="رابط انستغرام، فيسبوك الإيميل، أو رقم الهاتف..."
            className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-right"
            dir="rtl"
          />
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
          <button
            onClick={onSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            شاهد نتيجتك
          </button>
          
          <button
             onClick={onSkip}
             className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors py-2"
           >
             تخطي ورؤية النتيجة مباشرة بدون معلومات
           </button>
        </div>
      </div>
    </motion.div>
  );
});
