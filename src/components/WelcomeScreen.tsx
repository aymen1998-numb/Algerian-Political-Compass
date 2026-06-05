import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, Activity, Shield, Zap, CheckCircle2, Briefcase, Mail, Download } from 'lucide-react';
import { AppState } from '../types';
import { SocialProofHub } from './SocialProofHub';

interface WelcomeScreenProps {
  setAppState: (state: AppState) => void;
  startMarriageQuiz: () => void;
  startPersonalityQuiz: () => void;
  startPoliticalQuiz: () => void;
  startIdeologyQuiz: () => void;
  startVotingQuiz: () => void;
  startRulerQuiz: () => void;
  resultMarriage: any;
  resultPersonality: any;
  resultTribe: any;
  resultIdeology: any;
  resultVotingStyle: any;
  resultRuler: any;
  showInstallPrompt?: boolean;
  onInstallClick?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = memo(({
  setAppState, startMarriageQuiz, startPersonalityQuiz, startPoliticalQuiz,
  startIdeologyQuiz, startVotingQuiz, startRulerQuiz,
  resultMarriage, resultPersonality, resultTribe, resultIdeology, resultVotingStyle, resultRuler,
  showInstallPrompt, onInstallClick
}) => {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      {showInstallPrompt && (
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/20"
        >
           <div className="flex items-center gap-3 text-right">
              <div className="bg-white/20 p-2 rounded-xl">
                 <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                 <h4 className="text-white font-bold text-sm">حمل تطبيق أنا شكون؟</h4>
                 <p className="text-indigo-100 text-xs mt-1">تجربة أسرع للوصول إلى الاختبارات والمصارحات مباشرة من هاتفك.</p>
              </div>
           </div>
           <button 
             onClick={onInstallClick}
             className="whitespace-nowrap bg-white text-indigo-600 font-bold py-2 px-6 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all text-sm flex items-center gap-2"
           >
              <Download className="w-4 h-4" />
              تثبيت التطبيق
           </button>
        </motion.div>
      )}

      <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
            <Activity className="w-24 h-24 text-indigo-400 relative z-10 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            بوصلة الشارع الجزائري <br />
            <span className="text-indigo-400 mt-4 block font-extrabold drop-shadow-md text-3xl sm:text-4xl">شكون أنت فالدزاير؟</span>
          </h1>
          <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
            جاوب على بعض الأسئلة القصيرة في كل موضوع باش تكتشف بروفايلك الكامل في المجتمع. تقدر ديرهم كامل ولا تخير لي يعجبك!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={startMarriageQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-rose-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">الاستعداد للزواج</h3>
          </div>
          <p className="text-sm text-gray-400">واش راك واجد للارتباط العاطفي وبناء أسرة؟ ولا مزال الوقت؟</p>
          {resultMarriage && (
            <div className="mt-4 inline-block px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        <button
          onClick={startPersonalityQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-indigo-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">الشخصية</h3>
          </div>
          <p className="text-sm text-gray-400">واش من نوع من الشخصيات أنت في المجتمع الجزائري؟ النية، القافز، البارد؟</p>
          {resultPersonality && (
            <div className="mt-4 inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        <button
          onClick={startPoliticalQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-emerald-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">القبيلة </h3>
          </div>
          <p className="text-sm text-gray-400">أي قبيلة سياسية تنتمي لها؟ هل أنت مع الغيير الجذري ولا الاستقرار؟</p>
          {resultTribe && (
            <div className="mt-4 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        <button
          onClick={startIdeologyQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-amber-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">الأيديولوجية</h3>
          </div>
          <p className="text-sm text-gray-400">واش هي أفكارك؟ اشتراكي، ليبرالي، قومي وطني ولا محافظ؟</p>
          {resultIdeology && (
            <div className="mt-4 inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        <button
          onClick={startVotingQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-pink-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-pink-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">نمط التصويت</h3>
          </div>
          <p className="text-sm text-gray-400">كيفاش تتعامل مع الانتخابات في الجزائر؟ تفوطي بالمصلحة والقناعة ولا تقاطع؟</p>
          {resultVotingStyle && (
            <div className="mt-4 inline-block px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        <button
          onClick={startRulerQuiz}
          className="p-6 glass-panel hover:bg-white/5 border border-blue-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">الملك الحاكم</h3>
          </div>
          <p className="text-sm text-gray-400">لوكان تحكم أنت، شكون هو الحاكم لي تشبهلو؟ قبضة حديدية ولا حاكم حكيم؟</p>
          {resultRuler && (
            <div className="mt-4 inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-bold">
               انتهى - شاهد النتيجة
            </div>
          )}
        </button>

        {(resultPersonality && resultTribe && resultVotingStyle && resultIdeology && resultRuler) && (
          <button
            onClick={() => setAppState('result_ruler')}
            className="p-6 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-right rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-2xl font-bold text-white">البروفايل الكامل</h3>
               <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-sm text-indigo-100 mb-4">كشفت كل أجزاء البوصلة! تقدر تحمل صورتك الكاملة من تحت وتزين بيها ستورياتك.</p>
          </button>
        )}
        
        {/* SOCIAL PROOF HUB */}
        <SocialProofHub />

        {/* CONFESSIONS BUTTON */}
        <button
          onClick={() => setAppState('confessions_dashboard')}
          className="p-6 bg-gradient-to-tr from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-white/20 text-right rounded-2xl shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-3 mt-4"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2">صارحني - رسائل مجهولة 💌</h3>
            <p className="text-sm text-pink-100">أسس صندوق بريدك السري، شارك الرابط مع زملائك وتلقى اعترافات ومصارحات مجهولة بكل سرية.</p>
          </div>
          <Mail className="w-8 h-8 text-white animate-pulse" />
        </button>

        {/* ABOUT US BUTTON */}
        <button
          onClick={() => setAppState('about')}
          className="p-6 glass-panel hover:bg-white/5 border border-gray-500/20 text-right rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-3 mt-4"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2">من نحن؟ (About Us)</h3>
            <p className="text-sm text-gray-400">تعرف على مشروع DZAnalytica والخدمات اللي نقدموها في تحليل البيانات والذكاء الاصطناعي.</p>
          </div>
          <Briefcase className="w-8 h-8 text-gray-400" />
        </button>

      </div>
    </motion.div>
  );
});
