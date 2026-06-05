import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, getCountFromServer, limit, orderBy } from 'firebase/firestore';
import { Users, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { PERSONALITIES, getText } from '../data';

export function SocialProofHub() {
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);
  const [topPersonalities, setTopPersonalities] = useState<{ id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAggregateData = async () => {
      try {
        // Fetch total count using the efficient getCountFromServer 
        const coll = collection(db, 'results');
        const snapshot = await getCountFromServer(coll);
        const total = snapshot.data().count;

        // Note: For a real production app with thousands of docs, querying all and calculating locally
        // is expensive. It's better to maintain aggregated counters via Cloud Functions.
        // For this demo, we'll fetch up to a reasonable limit to approximate the top personalities
        // without incurring huge read costs.
        const q = query(coll, orderBy('createdAt', 'desc'), limit(100)); 
        const querySnapshot = await getDocs(q);
        
        let localTotal = 0;
        const counts: Record<string, number> = {};
        
        querySnapshot.forEach((doc) => {
          localTotal++;
          const data = doc.data();
          if (data.personality) {
            counts[data.personality] = (counts[data.personality] || 0) + 1;
          }
        });

        const sortedPersonalities = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([id, count]) => ({ id, count }));

        // Use server count if greater, else local count (in case getCountFromServer had a delay)
        setTotalParticipants(Math.max(total, localTotal));
        setTopPersonalities(sortedPersonalities);
      } catch (error) {
        console.error("Error fetching social proof data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregateData();
  }, []);

  if (loading || !totalParticipants || totalParticipants === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-3 flex animate-pulse">
        <div className="h-16 w-16 bg-zinc-800 rounded-2xl mb-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden relative shadow-2xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 blur-3xl rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch">
          
          {/* Total Stats */}
          <div className="flex-1 text-right border-l-0 md:border-l border-white/10 pl-0 md:pl-8">
             <div className="flex items-center gap-3 mb-2 justify-end">
               <h3 className="text-zinc-400 font-medium">المشاركين فالبوصلة</h3>
               <Users className="w-5 h-5 text-indigo-400" />
             </div>
             <div className="flex items-baseline justify-end gap-2">
                <span className="text-green-400 font-bold flex items-center">
                   <ArrowUpRight className="w-4 h-4" />
                </span>
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {totalParticipants.toLocaleString()}
                </span>
             </div>
             <p className="text-sm text-zinc-500 mt-2">جزائري وجزائرية اكتشفوا بروفايلهم السياسيو-اجتماعي</p>
          </div>

          {/* Top Trends */}
          <div className="flex-[2] w-full">
             <div className="flex items-center gap-3 mb-4 justify-end">
               <h3 className="text-zinc-400 font-medium">أكثر الشخصيات انتشاراً</h3>
               <Activity className="w-5 h-5 text-rose-400" />
             </div>

             <div className="flex flex-col gap-3">
                {topPersonalities.map((item, index) => {
                   const personalityData = PERSONALITIES[item.id as keyof typeof PERSONALITIES];
                   if (!personalityData) return null;
                   
                   const percentage = Math.round((item.count / totalParticipants) * 100);
                   
                   return (
                     <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg relative overflow-hidden">
                           #{index + 1}
                           <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: personalityData.color }}></div>
                        </div>
                        <div className="flex-1 text-right">
                           <h4 className="text-white font-bold">{getText(personalityData.name, 'male')}</h4>
                           <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden" dir="ltr">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${percentage}%`, backgroundColor: personalityData.color }}
                              ></div>
                           </div>
                        </div>
                        <div className="text-left min-w[3rem]">
                           <span className="text-xl font-bold text-white">{percentage}%</span>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
