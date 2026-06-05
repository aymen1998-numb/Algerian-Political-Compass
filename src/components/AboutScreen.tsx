import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Search, Zap, HeartHandshake, Share2, Laptop, Facebook, RotateCcw, Linkedin } from 'lucide-react';
import { XLogo } from './XLogo';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = memo(({ onBack }) => {
  return (
    <motion.div
      key="about"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-right space-y-6"
    >
      <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
            <Briefcase className="w-20 h-20 text-blue-400 relative z-10" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white text-center mb-8">عن DZAnalytica</h2>
        
        <div className="space-y-6 text-gray-300">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              من نحن؟
            </h3>
            <p className="leading-relaxed">
              نحن مشروع <strong>DZAnalytica</strong>، منصة جزائرية متخصصة في جمع وتحليل البيانات (Data Harvesting & Analytics). هدفنا هو فهم الديناميكيات الاجتماعية، الاقتصادية، والسياسية في الجزائر باستعمال أدوات الذكاء الاصطناعي وتحليل البيانات الضخمة. هذا الاختبار (أنا شكون؟) هو إحدى مبادراتنا لفهم بوصلة الشارع الجزائري بطريقة تفاعلية وممتعة.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              خدماتنا
            </h3>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>جمع وتحليل البيانات بأساليب متطورة.</li>
              <li>دراسات السوق واستطلاعات الرأي للشركات والمؤسسات.</li>
              <li>بناء النماذج التنبؤية باستخدام الذكاء الاصطناعي.</li>
              <li>تطوير تطبيقات تفاعلية لجمع البيانات بطرق مبتكرة.</li>
            </ul>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-blue-400" />
              اتصل بنا
            </h3>
            <p className="leading-relaxed mb-4">
              نحن دائمًا منفتحون على التعاون والشراكات. سواء كنت باحثاً، مطوراً، أو تمثل مؤسسة، لا تتردد في التواصل معنا لمعرفة المزيد عن حلولنا.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a href="mailto:contact@dzanalytica.com" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                <Share2 className="w-5 h-5" />
                contact@dzanalytica.com
              </a>
              <a href="https://dzanalytica.com" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                <Laptop className="w-5 h-5" />
                زيارة الموقع
              </a>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <a href="https://www.facebook.com/share/17kVGduxqn/" target="_blank" rel="noopener noreferrer" className="p-3 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-full transition-all">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://x.com/DZAnalytica" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 text-white hover:bg-white hover:text-black rounded-full transition-all">
                <XLogo className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/company/dzanalytica" target="_blank" rel="noopener noreferrer" className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white rounded-full transition-all">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            الرجوع للرئيسية
          </button>
        </div>
      </div>
    </motion.div>
  );
});
