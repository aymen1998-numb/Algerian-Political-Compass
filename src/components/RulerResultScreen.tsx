import React, { memo, useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Share2, Instagram, ArrowLeft, CheckCircle2, RotateCcw, Twitter, MessageCircle, BarChart3, Award, Hammer, Shield, Flame, Feather, Sword, HeartHandshake, Lightbulb, Users } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Gender, MarriageReadinessId, ParentingReadinessId, PersonalityId,
  TribeId, VotingStyleId, IdeologyId, RulerId,
  MARRIAGE_READINESS, PARENTING_READINESS, PERSONALITIES,
  TRIBES, VOTING_STYLES, IDEOLOGIES, RULERS, getText,
  BADGES, QuizResults
} from '../data';

interface PendingQuizInfo {
  title: string;
  start: () => void;
  colorName: string;
  hoverColorName: string;
}

interface RulerResultScreenProps {
  resultCardRef: React.RefObject<HTMLDivElement>;
  isGeneratingImage: boolean;
  userGender: Gender;
  resultRuler: RulerId;
  resultMarriage: MarriageReadinessId | null;
  resultParenting: ParentingReadinessId | null;
  resultPersonality: PersonalityId | null;
  resultTribe: TribeId | null;
  resultVotingStyle: VotingStyleId | null;
  resultIdeology: IdeologyId | null;
  pendingQuiz?: PendingQuizInfo | null;
  renderIcon: (iconName: string, className?: string) => React.ReactNode;
  onShare: (platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'download', title: string, text: string) => void;
  onRestart: () => void;
}

export const RulerResultScreen: React.FC<RulerResultScreenProps> = memo(({
  resultCardRef,
  isGeneratingImage,
  userGender,
  resultRuler,
  resultMarriage,
  resultParenting,
  resultPersonality,
  resultTribe,
  resultVotingStyle,
  resultIdeology,
  pendingQuiz,
  renderIcon,
  onShare,
  onRestart
}) => {
  const [stats, setStats] = useState<{ id: string, percentage: number }[]>([]);
  const [fetchingStats, setFetchingStats] = useState(false);

  useEffect(() => {
    if (!isGeneratingImage) {
      const fetchStats = async () => {
        setFetchingStats(true);
        try {
          const q = query(
             collection(db, 'results'), 
             where('quizCategory', '==', 'ruler'),
             limit(200)
          );
          const snap = await getDocs(q);
          const counts: Record<string, number> = {};
          let total = 0;
          snap.forEach(doc => {
            const data = doc.data();
            const trait = data.traitId;
            if (trait && RULERS[trait as RulerId]) {
              counts[trait] = (counts[trait] || 0) + 1;
              total++;
            }
          });
          
          if (total > 0) {
             const calculatedStats = Object.keys(RULERS).map(id => {
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
  }, [isGeneratingImage]);

  const earnedBadges = useMemo(() => {
    if (!resultRuler || !resultMarriage || !resultParenting || !resultPersonality || !resultTribe || !resultVotingStyle || !resultIdeology) {
      return [];
    }
    const results: QuizResults = {
      ruler: resultRuler,
      marriage: resultMarriage,
      parenting: resultParenting,
      personality: resultPersonality,
      tribe: resultTribe,
      votingStyle: resultVotingStyle,
      ideology: resultIdeology
    };
    return BADGES.filter(badge => badge.condition(results));
  }, [resultRuler, resultMarriage, resultParenting, resultPersonality, resultTribe, resultVotingStyle, resultIdeology]);

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="w-8 h-8 text-amber-400" />;
      case 'Hammer': return <Hammer className="w-8 h-8 text-blue-400" />;
      case 'Shield': return <Shield className="w-8 h-8 text-green-400" />;
      case 'Flame': return <Flame className="w-8 h-8 text-red-400" />;
      case 'Feather': return <Feather className="w-8 h-8 text-purple-400" />;
      case 'Sword': return <Sword className="w-8 h-8 text-zinc-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-8 h-8 text-pink-400" />;
      case 'Lightbulb': return <Lightbulb className="w-8 h-8 text-yellow-400" />;
      case 'Users': return <Users className="w-8 h-8 text-teal-400" />;
      default: return <Award className="w-8 h-8 text-white" />;
    }
  };

  return (
    <motion.div
      key="result_ruler"
      ref={resultCardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`glass-panel rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col ${isGeneratingImage ? 'border-none' : 'border border-white/10'}`}
      style={{ backgroundColor: isGeneratingImage ? '#0f0f13' : undefined }}
    >
      {/* Header/Banner Section */}
      <div className="relative p-6 sm:p-8 pb-10 text-center bg-gradient-to-b from-black/60 to-transparent">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none ${RULERS[resultRuler].color}`}>
           {renderIcon(RULERS[resultRuler].icon, "w-[300px] h-[300px]")}
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-current to-transparent opacity-50"></span>
            <span className={`px-4 py-1.5 rounded-full bg-black/40 shadow-inner ${RULERS[resultRuler].color} font-bold text-xs tracking-widest uppercase border border-white/10 backdrop-blur-md`}>
              البروفايل السياسي الشامل
            </span>
            <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-current to-transparent opacity-50"></span>
          </div>
          
          <h3 className="text-lg sm:text-xl text-gray-300 mb-2 font-medium">{userGender === 'male' ? 'لو كنتَ حاكماً لَكُنتَ' : 'لو كنتِ حاكمةً لَكُنتِ'}</h3>
          <h2 className={`text-4xl sm:text-5xl font-black mb-4 leading-tight flex flex-col items-center justify-center gap-4 drop-shadow-2xl ${RULERS[resultRuler].color}`}>
            <div className="p-4 sm:p-5 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              {renderIcon(RULERS[resultRuler].icon, "w-16 h-16 sm:w-20 sm:h-20 text-white")}
            </div>
            <span className="tracking-tight">{getText(RULERS[resultRuler].name, userGender)}</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-200 leading-snug max-w-2xl mx-auto font-medium drop-shadow-md">
            {getText(RULERS[resultRuler].description, userGender)}
          </p>
        </div>
      </div>

      {/* Profile Breakdown Section */}
      <div className="px-4 sm:px-6 pb-6 relative z-10 -mt-4">
        {resultMarriage && resultParenting && resultPersonality && resultTribe && resultVotingStyle && resultIdeology && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${MARRIAGE_READINESS[resultMarriage].color}`}>
                {renderIcon(MARRIAGE_READINESS[resultMarriage].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">الاستعداد للزواج</span>
                <strong className={`block text-base sm:text-lg font-bold ${MARRIAGE_READINESS[resultMarriage].color}`}>{getText(MARRIAGE_READINESS[resultMarriage].name, userGender)}</strong>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${PARENTING_READINESS[resultParenting].color}`}>
                {renderIcon(PARENTING_READINESS[resultParenting].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">الاستعداد للإنجاب</span>
                <strong className={`block text-base sm:text-lg font-bold ${PARENTING_READINESS[resultParenting].color}`}>{getText(PARENTING_READINESS[resultParenting].name, userGender)}</strong>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${PERSONALITIES[resultPersonality].color}`}>
                 {renderIcon(PERSONALITIES[resultPersonality].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">الشخصية السائدة</span>
                <strong className={`block text-base sm:text-lg font-bold ${PERSONALITIES[resultPersonality].color}`}>{getText(PERSONALITIES[resultPersonality].name, userGender)}</strong>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${TRIBES[resultTribe].color}`}>
                 {renderIcon(TRIBES[resultTribe].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">القبيلة السياسية</span>
                <strong className={`block text-base sm:text-lg font-bold ${TRIBES[resultTribe].color}`}>{getText(TRIBES[resultTribe].name, userGender)}</strong>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${VOTING_STYLES[resultVotingStyle].color}`}>
                 {renderIcon(VOTING_STYLES[resultVotingStyle].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">أسلوب التصويت</span>
                <strong className={`block text-base sm:text-lg font-bold ${VOTING_STYLES[resultVotingStyle].color}`}>{getText(VOTING_STYLES[resultVotingStyle].name, userGender)}</strong>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-xl hover:bg-black/60 transition-colors group">
              <div className={`p-3 rounded-2xl bg-white/5 w-12 h-12 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${IDEOLOGIES[resultIdeology].color}`}>
                 {renderIcon(IDEOLOGIES[resultIdeology].icon, "w-6 h-6")}
              </div>
              <div className="text-right flex-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 opacity-80">الأيديولوجية</span>
                <strong className={`block text-base sm:text-lg font-bold ${IDEOLOGIES[resultIdeology].color}`}>{getText(IDEOLOGIES[resultIdeology].name, userGender)}</strong>
              </div>
            </div>
          </div>
        )}

        {!isGeneratingImage && earnedBadges.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8 mt-4">
            <h4 className="text-xl text-yellow-500 font-bold mb-4 flex justify-center items-center gap-2 drop-shadow-md">
              <Award className="w-6 h-6" />
              الأوسمة المكتسبة
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="bg-gradient-to-br from-zinc-900 to-black p-4 rounded-3xl border border-yellow-500/30 flex items-center gap-4 shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:scale-105 transition-transform max-w-[300px]">
                  <div className="p-3 bg-white/5 rounded-2xl flex-shrink-0">
                    {renderBadgeIcon(badge.iconName)}
                  </div>
                  <div className="text-right">
                    <strong className="block text-yellow-500 font-bold text-lg mb-1">{getText(badge.title, userGender)}</strong>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{getText(badge.description, userGender)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isGeneratingImage && (
           <div className="mt-4 text-center border-t border-white/10 pt-4 pb-2">
              <p className="text-emerald-400 font-black tracking-widest text-base sm:text-lg mb-1 drop-shadow-md">💎 بوصلة السياسة الجزائرية</p>
              <p className="text-xs text-gray-400 font-medium">اكتشف شخصيتك السياسية الآن</p>
           </div>
        )}

        {!isGeneratingImage && (
          <div className="max-w-lg mx-auto bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 mb-8 mt-6">
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
                  const traitDef = RULERS[id as RulerId];
                  const isUser = id === resultRuler;
                  const colorClass = traitDef.color ? traitDef.color.replace('text-', 'bg-') : 'bg-indigo-500';
                  
                  return (
                    <div key={id} className={`p-3 rounded-xl border ${isUser ? 'bg-white/5 border-white/20' : 'border-transparent'}`}>
                       <div className="flex justify-between items-center mb-2">
                         <span className={`font-medium ${isUser ? 'text-white' : 'text-zinc-400'}`}>
                           {getText(traitDef.name, userGender)} {isUser && ' (أنت)'}
                         </span>
                         <span className="text-zinc-300 font-bold">{percentage}%</span>
                       </div>
                       <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden" dir="ltr">
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
                <p className="text-sm text-zinc-500 text-center">لا توجد بيانات كافية بعد.</p>
            )}
          </div>
        )}

        {pendingQuiz && !isGeneratingImage && (
          <div className="bg-blue-950/40 p-6 sm:p-8 rounded-3xl border border-blue-500/20 mt-8 shadow-inner text-center">
            <h4 className="text-xl sm:text-2xl text-blue-300 font-black mb-3">مازال كاين المزيد! 🔍</h4>
            <p className="text-sm sm:text-base text-blue-200/80 mb-6">
              تقدر تكمل تستكشف باقي الجوانب الخاصة بك في البوصلة السياسية.
            </p>
            <button
              onClick={pendingQuiz.start}
              className={`w-full sm:w-auto mx-auto px-8 py-4 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 flex items-center justify-center gap-3 ${pendingQuiz.colorName} ${pendingQuiz.hoverColorName}`}
            >
              <span className="text-lg">{pendingQuiz.title}</span>
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {!isGeneratingImage && !pendingQuiz && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center p-6 sm:p-8 bg-black/50 border-t border-white/5 backdrop-blur-xl relative z-10">
          <button
            onClick={() => onShare('facebook', "البروفايل الكامل", "في بوصلة السياسة الجزائرية")}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-5 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(24,119,242,0.3)] hover:shadow-[0_0_25px_rgba(24,119,242,0.5)] active:scale-95 text-base"
          >
            <Share2 className="w-5 h-5 fill-current" />
            <span>فيسبوك</span>
          </button>

          <button
            onClick={() => onShare('instagram', "البروفايل الكامل", "في بوصلة السياسة الجزائرية")}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-3 px-5 py-4 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(230,104,60,0.3)] hover:shadow-[0_0_25px_rgba(230,104,60,0.5)] active:scale-95 text-base"
          >
            <Instagram className="w-5 h-5" />
            <span>إنستغرام</span>
          </button>

          <button
            onClick={() => onShare('twitter', "البروفايل الكامل", "في بوصلة السياسة الجزائرية")}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-3 px-5 py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 border border-white/20 text-base"
          >
            <Twitter className="w-5 h-5 fill-current text-white" />
            <span>X (تويتر)</span>
          </button>

          <button
            onClick={() => onShare('whatsapp', "البروفايل الكامل", "في بوصلة السياسة الجزائرية")}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-3 px-5 py-4 bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 text-base"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>واتساب</span>
          </button>

          <button
            onClick={() => onShare('download', "البروفايل الكامل", "في بوصلة السياسة الجزائرية")}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-3 px-5 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 text-base"
          >
            <span>تحميل مباشر</span>
          </button>
          
          <div className="w-full sm:w-auto basis-full mt-2 sm:mt-0">
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all active:scale-95 border border-white/10 text-base"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة التجربة</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
});
