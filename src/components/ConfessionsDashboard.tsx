import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, User } from 'firebase/auth';
import { ArrowLeft, Share2, Copy, Trash2, Mail, Loader2, LogOut, CheckCircle2, Eye, Send } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function ConfessionsDashboard({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ensure user document exists
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', currentUser.uid), {
              displayName: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || '',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }

        const q = query(
          collection(db, 'messages'),
          where('recipientId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        const unsubMsgs = onSnapshot(q, (snapshot) => {
          const msgs: any[] = [];
          snapshot.forEach((doc) => {
            msgs.push({ id: doc.id, ...doc.data() });
          });
          setMessages(msgs);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'messages');
          setLoading(false);
        });

        return () => unsubMsgs();
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = async (providerName: 'google' | 'facebook' | 'phone' | 'instagram') => {
    setLoginError('');
    if (providerName === 'phone') {
       alert('تسجيل الدخول برقم الهاتف سيكون متاحاً قريباً.');
       return;
    }
    if (providerName === 'instagram') {
       alert('تسجيل الدخول باستخدام انستغرام يتم عبر حساب فيسبوك حالياً.');
       // We could fall through to Facebook, but let's just make it do Facebook
    }

    const provider = (providerName === 'facebook' || providerName === 'instagram') ? new FacebookAuthProvider() : new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error') {
         setLoginError('يتعذر تسجيل الدخول داخل وضع المعاينة. يرجى فتح التطبيق في نافذة جديدة للمتابعة.');
      } else {
         setLoginError('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
    }
  };

  const getShareLink = () => {
    if (!user) return '';
    return `${window.location.origin}${window.location.pathname}?sarahni=${user.uid}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const link = getShareLink();
    const shareData = {
      title: 'صارحني - رسائل مجهولة',
      text: 'ابعثلي رسالة مجهولة وماراحش نعرف شكون أنت! 🤫🤫',
      url: link
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full flex flex-col items-center max-w-lg mx-auto"
    >
      <div className="w-full relative py-6 flex items-center justify-center">
        <button
          onClick={onBack}
          className="absolute right-0 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-pink-500" />
          رسائل مجهولة
        </span>
      </div>

      {!user ? (
        <div className="w-full bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm text-center">
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">أنشئ حسابك الخاص</h2>
          <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
            سجل دخولك لتلقي رسائل مجهولة من أصدقائك. لن يعرف أحد من المرسل أبداً!
          </p>
          <div className="space-y-3 w-full">
            <button
              onClick={() => handleLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-zinc-200 transition-colors active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              متابعة باستخدام Google
            </button>
            <button
              onClick={() => handleLogin('facebook')}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#1877F2]/90 transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              متابعة باستخدام Facebook
            </button>
            <button
              onClick={() => handleLogin('instagram')}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold py-4 px-6 rounded-2xl hover:opacity-90 transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              متابعة باستخدام Instagram
            </button>
            <button
              onClick={() => handleLogin('phone')}
              className="w-full flex items-center justify-center gap-3 bg-zinc-800 text-white font-bold py-4 px-6 rounded-2xl hover:bg-zinc-700 transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              متابعة برقم الهاتف
            </button>
          </div>

          {loginError && (
             <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm font-bold mb-3">{loginError}</p>
                <button
                   onClick={() => window.open(window.location.href, '_blank')}
                   className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                >
                   <Share2 className="w-4 h-4" />
                   فتح في نافذة جديدة
                </button>
             </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors" title="تسجيل الخروج">
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
            <div className="flex items-center gap-4 relative z-10 mb-6 mt-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-16 h-16 rounded-full border-2 border-white/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{user.displayName}</h3>
                <p className="text-pink-100 text-sm opacity-80">رسائلك محمية بسرية تامة</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4">
              <p className="text-white/80 text-sm mb-3">رابطك الخاص للاعترافات:</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-sm text-pink-100 truncate border border-white/5">
                  {getShareLink()}
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-white transition-colors border border-white/5"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={shareLink}
              className="w-full flex items-center justify-center gap-2 bg-white text-pink-600 font-bold py-4 rounded-xl transition-all hover:bg-pink-50 active:scale-95 shadow-xl"
            >
              <Share2 className="w-5 h-5" />
              مشاركة الرابط
            </button>
          </div>

          <div className="w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-zinc-400" />
              صندوق الرسائل ({messages.length})
            </h3>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                   <Mail className="w-8 h-8 text-zinc-500" />
                </div>
                <p className="text-zinc-400 font-medium">ليس لديك أي رسائل بعد!</p>
                <p className="text-zinc-500 text-sm mt-2">قم بمشاركة رابطك ليبدأ أصدقائك بمصارحتك</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-5 relative group"
                  >
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                         مجهول <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> 
                         <span dir="ltr">{msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                       </span>
                    </div>
                    <p className="text-white text-lg leading-relaxed whitespace-pre-wrap px-2 mb-6 text-center font-medium">
                      {msg.content}
                    </p>
                    <div className="flex gap-2 border-t border-white/5 pt-4">
                      
                      <button
                        onClick={() => alert(`معلومات مرسل الرسالة:\n\nالمرسل مجهول ولا يمكن تتبعه بالكامل.\nتم الإرسال من: ${msg.deviceInfo || 'جهاز غير معروف'}`)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                         من المرسل؟ <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => alert('سيتم إضافة خاصية الرد والمشاركة قريباً!')}
                        className="flex-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                         إظهار <Send className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 rounded-xl transition-colors flex items-center justify-center"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
