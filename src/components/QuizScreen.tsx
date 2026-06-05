import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gender, getText } from '../data';

interface QuizScreenProps {
  quizKey: string;
  title: string;
  partText?: string;
  questions: any[];
  currentIndex: number;
  userGender: Gender | null;
  onAnswer: (answer: any) => void;
  colorClass: string;
  colorHex: string; // for the progress bar e.g., 'from-rose-600 to-pink-500'
  colorBorderClass: string;
  colorBgClass: string;
}

export const QuizScreen: React.FC<QuizScreenProps> = memo(({
  quizKey,
  title,
  partText,
  questions,
  currentIndex,
  userGender,
  onAnswer,
  colorClass,
  colorHex,
  colorBorderClass,
  colorBgClass
}) => {
  return (
    <motion.div
      key={quizKey}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <div className={`flex justify-between items-center text-sm font-semibold ${colorClass} mb-3 glass-panel px-4 py-1.5 rounded-full border ${colorBorderClass} w-fit mb-4`}>
          <span>{partText || title}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-3">
          <span>السؤال {currentIndex + 1} من {questions.length}</span>
          <span>{Math.round((currentIndex / (questions.length - 1)) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full bg-gradient-to-r ${colorHex}`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white leading-tight">
              {getText(questions[currentIndex]?.text || '', userGender || 'male')}
            </h2>

            <div className="space-y-4">
              {questions[currentIndex]?.answers?.map((answer: any, index: number) => (
                <button
                  key={index}
                  onClick={() => onAnswer(answer)}
                  className="w-full text-right p-5 rounded-2xl glass-panel glass-panel-hover transition-all text-lg font-medium text-gray-200 hover:text-white flex items-center group active:scale-[0.98]"
                >
                  <div className={`w-8 h-8 rounded-full border-2 border-gray-600 group-hover:${colorBorderClass} flex items-center justify-center ml-4 shrink-0 transition-colors`}>
                    <div className={`w-3 h-3 rounded-full ${colorBgClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <span>{getText(answer.text, userGender || 'male')}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
