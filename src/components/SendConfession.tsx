import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Send, CheckCircle2, User as UserIcon, Loader2 } from 'lucide-react';

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
    authInfo: null, // Anonymous sending
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function SendConfession({ recipientId, onMakeOwn }: { recipientId: string, onMakeOwn: () => void }) {
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'sending' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', recipientId));
        if (userDoc.exists()) {
          setRecipientName(userDoc.data().displayName);
          setStatus('idle');
        } else {
          setErrorMessage('لم يتم العثور على المستخدم.');
          setStatus('error');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${recipientId}`);
        setErrorMessage('حدث خطأ أثناء تحميل بيانات المستخدم.');
        setStatus('error');
      }
    };
    fetchRecipient();
  }, [recipientId]);

  const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android (محمول)';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS (آيفون/آيباد)';
    if (/windows/i.test(ua)) return 'Windows PC (كمبيوتر)';
    if (/mac/i.test(ua)) return 'Mac (كمبيوتر)';
    return 'جهاز غير معروف';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 1000) return;
    setStatus('sending');

    try {
      await addDoc(collection(db, 'messages'), {
        recipientId: recipientId,
        content: content.trim(),
        deviceInfo: getDeviceInfo(),
        createdAt: serverTimestamp()
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      setErrorMessage('حدث خطأ أثناء الإرسال. تأكد من أن رسالتك لا تتجاوز 1000 حرف.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
        <p className="text-zinc-400">جاري التحميل...</p>
      </div>
    );
  }

  if (status === 'error' && !recipientName) {
    return (
      <div className="w-full max-w-lg mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
        <UserIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">تعذر العثور على الحساب</h2>
        <p className="text-zinc-400 mb-6">{errorMessage}</p>
        <button
          onClick={onMakeOwn}
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          أنشئ حسابك الخاص
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-gradient-to-br from-pink-600 to-rose-600 p-8 rounded-3xl shadow-lg relative overflow-hidden text-center"
      >
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">تم الإرسال بنجاح!</h2>
        <p className="text-pink-100 mb-8 max-w-xs mx-auto">
          تم إرسال رسالتك بسرية تامة. لن يعرف {recipientName} هويتك أبداً. 🤫
        </p>
        <button
          onClick={onMakeOwn}
          className="bg-white text-pink-600 font-bold py-4 px-8 rounded-2xl w-full transition-all hover:bg-pink-50 active:scale-95 shadow-xl"
        >
          جربها وأنشئ حسابك الخاص
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-zinc-950">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white text-center">
            أرسل رسالة مجهولة إلى<br/>
            <span className="text-pink-400 text-2xl mt-1 block">{recipientName}</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-3 text-center">لن يتمكن {recipientName} من معرفة هويتك أبداً</p>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب رسالتك الصريحة هنا..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-medium leading-relaxed"
              maxLength={1000}
              required
              disabled={status === 'sending'}
              dir="rtl"
            />
            <div className="absolute bottom-3 left-3 text-xs text-zinc-600 font-bold">
              {content.length}/1000
            </div>
          </div>

          {status === 'error' && (
             <p className="text-red-400 text-sm text-center font-bold px-2">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={!content.trim() || status === 'sending'}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 rounded-2xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)]"
          >
            {status === 'sending' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 -rotate-180" />
                إرسال بصراحة
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
           <button
             onClick={onMakeOwn}
             className="text-zinc-400 hover:text-white transition-colors text-sm font-medium border-b border-dashed border-zinc-600 hover:border-white pb-1"
           >
             بدلاً من ذلك، هل تريد إنشاء حسابك الخاص؟
           </button>
        </div>
      </div>
    </motion.div>
  );
}
