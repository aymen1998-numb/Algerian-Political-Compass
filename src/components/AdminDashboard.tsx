import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { AppState } from '../types';
import { Shield, Users, Mail, Activity, LogOut, Loader2, Database, Trash2, Key, Download } from 'lucide-react';

interface AdminDashboardProps {
  setAppState: (state: AppState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setAppState }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'confessions' | 'settings'>('submissions');
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // Check if admin
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
          fetchData();
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Data Engineering optimization: limits added to prevent fetching entire collections at once.
      const subSnapshot = await getDocs(query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(100)));
      setSubmissions(subSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const userSnapshot = await getDocs(query(collection(db, 'users'), limit(100)));
      setUsers(userSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const msgSnapshot = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(100)));
      setMessages(msgSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const adminSnapshot = await getDocs(query(collection(db, 'admins'), limit(100)));
      setAdminsList(adminSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      alert("Error fetching data. Check your permissions.");
    }
    setLoading(false);
  };

  const handleLogin = async (provider: 'google' | 'facebook') => {
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      await signInWithPopup(auth, authProvider);
    } catch (error: any) {
      console.error("Login Error:", error);
      alert("Login Error: " + error.message + (provider === 'facebook' ? " (Make sure Facebook App is configured in Firebase Console)" : ""));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const promoteToAdmin = async () => {
    if (!newAdminUid) {
      alert("Please enter the exact auth UID of the user you wish to make an admin.");
      return;
    }
    try {
      await setDoc(doc(db, 'admins', newAdminUid), {
        email: newAdminEmail || 'Unknown',
        promotedAt: new Date(),
        promotedBy: user?.uid
      });
      alert('Admin added successfully!');
      setNewAdminUid('');
      setNewAdminEmail('');
      fetchData(); // refresh lists
    } catch (error: any) {
      alert("Error adding admin: " + error.message);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      alert('لا توجد بيانات ليتم تصديرها');
      return;
    }

    const headers = ['التاريخ', 'الاختبار', 'النتيجة', 'معلومات الاتصال', 'تفاصيل الإجابات'];
    
    const csvContent = [
      headers.join(','),
      ...submissions.map(s => {
        const date = s.createdAt?.toDate().toLocaleString() || '';
        const quizName = s.quizName || '';
        const trait = s.winningTraitName || '';
        const contact = s.contactInfo || '';
        // Format answers as a single string, replacing commas with semicolons to avoid breaking CSV format
        const answers = s.answers ? s.answers.map((a: any) => `${a.question}: ${a.answerText}`).join(' | ').replace(/,/g, ';') : '';
        
        // Wrap fields containing commas or newlines in double quotes
        return [date, quizName, trait, contact, answers]
          .map(field => `"${String(field).replace(/"/g, '""')}"`)
          .join(',');
      })
    ].join('\\n');

    const blob = new Blob(['\\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Added BOM for UTF-8 magic
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz_results_export_\${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم (Admin Panel)</h1>
          <p className="text-zinc-400 mb-8">تسجيل الدخول للمدراء فقط.</p>
          
          <button 
            onClick={() => handleLogin('google')}
            className="w-full mb-3 bg-white text-zinc-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google تسجيل الدخول باستخدام
          </button>
          
          <button 
            onClick={() => handleLogin('facebook')}
            className="w-full mb-6 bg-[#1877F2] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#166FE5] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            Facebook تسجيل الدخول باستخدام
          </button>

          <button onClick={() => setAppState('welcome')} className="text-zinc-500 hover:text-white transition-colors text-sm">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">لاتملك صلاحيات المشرف</h1>
        <p className="text-zinc-400 mb-6">User ID: <code className="bg-zinc-800 text-pink-400 p-2 rounded">{user.uid}</code></p>
        <p className="text-zinc-500 mb-8 max-w-md">يرجى إضافة هذا المعرف إلى مجموعة المدراء في قاعدة البيانات للدخول.</p>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="bg-zinc-800 text-white font-bold py-2 px-6 rounded-xl hover:bg-zinc-700">تسجيل الخروج</button>
          <button onClick={() => setAppState('welcome')} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-indigo-700">الرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 flex flex-col max-w-7xl mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-full">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">لوحة تحكم أنا شكون؟</h1>
            <p className="text-zinc-400 text-sm">مرحباً، {user.displayName || user.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAppState('welcome')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors font-medium">الرئيسية</button>
          <button onClick={handleLogout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2"><LogOut className="w-4 h-4"/> خروج</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-zinc-900/50 p-2 rounded-xl">
        <button 
          onClick={() => setActiveTab('submissions')} 
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        >
          <Database className="w-5 h-5" /> الإجابات والمعلومات ({submissions.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        >
          <Users className="w-5 h-5" /> المستخدمين ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('confessions')} 
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'confessions' ? 'bg-teal-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        >
          <Mail className="w-5 h-5" /> المصارحات ({messages.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-amber-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        >
          <Key className="w-5 h-5" /> المدراء
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col">
        
        {activeTab === 'submissions' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button 
                onClick={exportToCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> تصدير النتائج (CSV)
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="py-3 px-4 font-medium">التاريخ</th>
                  <th className="py-3 px-4 font-medium">الاختبار</th>
                  <th className="py-3 px-4 font-medium">النتيجة</th>
                  <th className="py-3 px-4 font-medium">معلومات الاتصال (Email/FB)</th>
                  <th className="py-3 px-4 font-medium">عرض الإجابات</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm text-zinc-300">{s.createdAt?.toDate().toLocaleString()}</td>
                    <td className="py-3 px-4"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm">{s.quizName}</span></td>
                    <td className="py-3 px-4 text-emerald-400">{s.winningTraitName}</td>
                    <td className="py-3 px-4 font-mono text-sm">{s.contactInfo}</td>
                    <td className="py-3 px-4">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-400 hover:text-blue-300">عرض</summary>
                        <ul className="mt-2 text-zinc-400 bg-black/30 p-2 rounded max-h-40 overflow-y-auto">
                          {s.answers?.map((a: any, i: number) => (
                            <li key={i} className="mb-2"><strong>{a.question}</strong><br/><span className="text-indigo-300">{a.answerText}</span></li>
                          ))}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-zinc-500">لا توجد بيانات بعد.</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {users.map(u => (
              <div key={u.id} className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                {u.photoURL ? (
                   <img src={u.photoURL} alt="User avatar" className="w-12 h-12 rounded-full hidden sm:block" />
                ) : (
                   <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xl">{u.displayName?.substring(0,2) || '؟'}</div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-white truncate">{u.displayName}</h3>
                  <p className="text-xs text-zinc-500 truncate" dir="ltr">{u.id}</p>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="col-span-3 py-8 text-center text-zinc-500">لا يوجد مستخدمين مسجلين.</div>}
          </div>
        )}

        {activeTab === 'confessions' && (
          <div className="overflow-x-auto">
             <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="py-3 px-4 font-medium">التاريخ</th>
                  <th className="py-3 px-4 font-medium">لمن أرسلت؟ (Recipient ID)</th>
                  <th className="py-3 px-4 font-medium">الرسالة</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm text-zinc-300 w-48">{m.createdAt?.toDate().toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs font-mono text-zinc-500 w-48" dir="ltr">{m.recipientId}</td>
                    <td className="py-3 px-4 text-sm"><div className="bg-black/20 p-3 rounded-lg">{m.content}</div></td>
                  </tr>
                ))}
                {messages.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-zinc-500">لا توجد مصارحات متبادلة بعد.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/30 p-6 rounded-xl border border-white/5">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-amber-500"/> إضافة مدير جديد</h2>
               <p className="text-sm text-zinc-400 mb-6">لإضافة مدير جديد، تحتاج إلى الـ UID الخاص بحسابه (معرف المستخدم) الموجود في قاعدة البيانات عند تسجيل دخوله الأول.</p>
               
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm text-zinc-400 mb-1">معرف المستخدم (Auth UID)</label>
                    <input 
                       type="text" 
                       value={newAdminUid}
                       onChange={(e) => setNewAdminUid(e.target.value)}
                       placeholder="مثال: abc123def456ghi789" 
                       className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-left font-mono focus:border-amber-500 outline-none"
                       dir="ltr"
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-zinc-400 mb-1">الاسم أو البريد (للتذكر فقط)</label>
                    <input 
                       type="text" 
                       value={newAdminEmail}
                       onChange={(e) => setNewAdminEmail(e.target.value)}
                       placeholder="admin@example.com" 
                       className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-left focus:border-amber-500 outline-none"
                       dir="ltr"
                    />
                 </div>
                 <button 
                   onClick={promoteToAdmin}
                   className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors"
                 >
                   إضافة كمدير
                 </button>
               </div>
            </div>

            <div className="bg-black/30 p-6 rounded-xl border border-white/5">
               <h2 className="text-xl font-bold mb-4">قائمة المدراء</h2>
               <div className="space-y-3">
                 {adminsList.map(a => (
                   <div key={a.id} className="bg-zinc-900/50 p-4 rounded-lg flex items-center justify-between">
                     <div className="overflow-hidden">
                       <p className="font-bold text-white">{a.email}</p>
                       <p className="text-xs text-zinc-500 font-mono" dir="ltr">{a.id}</p>
                     </div>
                     {a.id === user?.uid && <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded font-bold">أنت</span>}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
