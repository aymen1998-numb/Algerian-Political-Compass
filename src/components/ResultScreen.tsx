import React, { memo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, Instagram, ArrowLeft, Home, Twitter, MessageCircle, BarChart3 } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { getText, Gender } from '../data';

interface PendingQuizInfo {
  title: string;
  start: () => void;
  colorName: string;
  hoverColorName: string;
}

interface ResultScreenProps {
  resultKey: string;
  resultCardRef: React.RefObject<HTMLDivElement>;
  isGeneratingImage: boolean;
  color: string;
  largeIcon: React.ReactNode;
  smallIcon: React.ReactNode;
  title: string;
  subTitle: string;
  name: string;
  description: string;
  pendingQuiz?: PendingQuizInfo | null;
  onShareFacebook?: () => void;
  onShareInstagram?: () => void;
  onShareTwitter?: () => void;
  onShareWhatsApp?: () => void;
  onHome?: () => void;
  onFullProfile?: () => void;
  nextButtonLabel?: string;
  quizCategory?: string;
  userTraitId?: string;
  allTraits?: Record<string, { id: string, name: any, color: string }>;
  userGender?: Gender;
  children?: React.ReactNode;
}

export const ResultScreen: React.FC<ResultScreenProps> = memo(({
  resultKey,
  resultCardRef,
  isGeneratingImage,
  color,
  largeIcon,
  smallIcon,
  title,
  subTitle,
  name,
  description,
  pendingQuiz,
  onShareFacebook,
  onShareInstagram,
  onShareTwitter,
  onShareWhatsApp,
  onHome,
  onFullProfile,
  nextButtonLabel,
  quizCategory,
  userTraitId,
  allTraits,
  userGender,
  children
}) => {
  const [stats, setStats] = useState<{ id: string, percentage: number }[]>([]);
  const [fetchingStats, setFetchingStats] = useState(false);

  useEffect(() => {
    if (quizCategory && allTraits && !isGeneratingImage) {
      const fetchStats = async () => {
        setFetchingStats(true);
        try {
          const q = query(
             collection(db, 'results'), 
             where('quizCategory', '==', quizCategory),
             limit(200)
          );
          const snap = await getDocs(q);
          const counts: Record<string, number> = {};
          let total = 0;
          snap.forEach(doc => {
            const data = doc.data();
            const trait = data.traitId || data.personality;
            if (trait && allTraits[trait]) {
              counts[trait] = (counts[trait] || 0) + 1;
              total++;
            }
          });
          
          if (total > 0) {
             const calculatedStats = Object.keys(allTraits).map(id => {
                const count = counts[id] || 0;
                return {
                  id,
                  percentage: Math.round((count / total) * 100)
                };
             }).sort((a, b) => b.percentage - a.percentage);
             setStats(calculatedStats);
          }
        } catch (e) {
          console.error("Failed to load compare stats", e);
        } finally {
          setFetchingStats(false);
        }
      };
      fetchStats();
    }
  }, [quizCategory, allTraits, isGeneratingImage]);

  return (
    <motion.div
      key={resultKey}
      ref={resultCardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`glass-panel p-5 sm:p-12 rounded-3xl shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden flex flex-col ${isGeneratingImage ? 'border-none' : 'border border-white/10'}`}
      style={{ backgroundColor: isGeneratingImage ? '#0f0f13' : undefined }}
    >
      <div className={`absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform -rotate-12 ${color}`}>
         {largeIcon}
      </div>

      <div className="relative z-10 text-center">
        <span className={`inline-block px-4 py-1.5 rounded-xl bg-zinc-800 ${color} font-semibold text-sm sm:text-base mb-4 sm:mb-6 border border-current/20`}>
          {title}
        </span>
        
        <h3 className="text-xl sm:text-2xl text-gray-400 mb-2">{subTitle}</h3>
        <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-tight flex flex-col items-center justify-center gap-2 sm:gap-4 ${color}`}>
          {smallIcon}
          <span>{name}</span>
        </h2>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5 mb-6 sm:mb-8">
          {description}
        </p>

        {!isGeneratingImage && quizCategory && allTraits && userGender && (
          <div className="max-w-lg mx-auto bg-zinc-900/50 p-6 rounded-2xl border border-white/5 mb-8">
            <h4 className="text-lg text-zinc-300 font-bold mb-4 flex justify-center items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              مقارنة نتائجك مع الآخرين
            </h4>
            {fetchingStats ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : stats.length > 0 ? (
              <div className="space-y-4">
                {stats.map(({ id, percentage }) => {
                  const traitDef = allTraits[id];
                  const isUser = id === userTraitId;
                  const colorClass = traitDef.color ? traitDef.color.replace('text-', 'bg-') : 'bg-indigo-500';
                  
                  return (
                    <div key={id} className={`p-3 rounded-xl border ${isUser ? 'bg-white/5 border-white/20' : 'border-transparent'}`}>
                       <div className="flex justify-between items-center mb-2">
                         <span className={`font-medium ${isUser ? 'text-white' : 'text-zinc-400'}`}>
                           {getText(traitDef.name, userGender)} {isUser && ' (أنت)'}
                         </span>
                         <span className="text-zinc-300 font-bold">{percentage}%</span>
                       </div>
                       <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden" dir="ltr">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                           style={{ width: `${percentage}%` }}
                         ></div>
                       </div>
                    </div>
                  )
                })}
              </div>
            ) : (
                <p className="text-sm text-zinc-500">لا توجد بيانات كافية بعد.</p>
            )}
          </div>
        )}

        {children}

        {!isGeneratingImage && (
          <div className="bg-indigo-950/40 p-5 rounded-2xl border border-indigo-500/20 mb-4 sm:mb-8 text-center mt-auto">
            {pendingQuiz ? (
              <>
                <h4 className="text-lg text-indigo-300 font-bold mb-2">مازال كاين المزيد! 🔍</h4>
                <p className="text-sm text-indigo-200/70 mb-0">
                  تقدر تكمل تستكشف باقي الجوانب الخاصة بك في المجتمع عبر الزر أدناه.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-lg text-indigo-300 font-bold mb-2">اكتملت الاختبارات! 🎉</h4>
                <p className="text-sm text-indigo-200/70 mb-0">
                  لقد أكملت جميع الاختبارات بنجاح! يمكنك العودة لاستكشاف بروفايلك الكامل.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {!isGeneratingImage && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 justify-center relative z-10 border-t border-white/10 pt-5 sm:pt-6">
          
          {(onShareFacebook || onShareInstagram || onShareTwitter || onShareWhatsApp) && (
            <div className="w-full flex gap-2 sm:gap-3 justify-center mb-2 sm:mb-4 flex-wrap">
              {onShareFacebook && (
                <button
                  onClick={onShareFacebook}
                  className="flex-1 min-w-[110px] sm:min-w-[140px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-4 sm:py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>فيسبوك</span>
                </button>
              )}
              {onShareInstagram && (
                <button
                  onClick={onShareInstagram}
                  className="flex-1 min-w-[110px] sm:min-w-[140px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-4 sm:py-4 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>إنستغرام</span>
                </button>
              )}
              {onShareTwitter && (
                <button
                  onClick={onShareTwitter}
                  className="flex-1 min-w-[110px] sm:min-w-[140px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-4 sm:py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 border border-white/20 text-sm sm:text-base"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
                  <span>X</span>
                </button>
              )}
              {onShareWhatsApp && (
                <button
                  onClick={onShareWhatsApp}
                  className="flex-1 min-w-[110px] sm:min-w-[140px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-4 sm:py-4 bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>واتساب</span>
                </button>
              )}
            </div>
          )}

          {pendingQuiz && (
            <button
              onClick={pendingQuiz.start}
              className={`flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center gap-2 px-3 py-3 sm:px-4 sm:py-4 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base ${pendingQuiz.colorName} ${pendingQuiz.hoverColorName}`}
            >
              <span>{nextButtonLabel || pendingQuiz.title}</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {onFullProfile && (
            <button
              onClick={onFullProfile}
              className="flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center gap-2 px-3 py-3 sm:px-4 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
            >
              <span>البروفايل الكامل</span>
            </button>
          )}

          {onHome && (
            <button
              onClick={onHome}
              className="flex-1 min-w-[110px] sm:min-w-[140px] flex items-center justify-center gap-2 px-3 py-3 sm:px-4 sm:py-4 glass-panel hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95 text-sm sm:text-base"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});
