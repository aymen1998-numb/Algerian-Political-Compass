import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Activity, Share2, Facebook, RotateCcw, CheckCircle2, Shield, Flame, TrendingUp, Laptop, Zap, Search, Heart, Coffee, ArrowLeft, Instagram, HeartHandshake, Briefcase, HelpCircle, Home, XCircle, Linkedin } from 'lucide-react';
import { AppState } from './types';
import { MARRIAGE_QUESTIONS, MARRIAGE_READINESS, MarriageReadinessId, PARENTING_QUESTIONS, PARENTING_READINESS, ParentingReadinessId, PERSONALITY_QUESTIONS, POLITICAL_QUESTIONS, VOTING_QUESTIONS, IDEOLOGY_QUESTIONS, RULER_QUESTIONS, PERSONALITIES, TRIBES, VOTING_STYLES, IDEOLOGIES, RULERS, PersonalityId, TribeId, VotingStyleId, IdeologyId, RulerId, Gender, getText } from './data';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

import { XLogo } from './components/XLogo';
import { AboutScreen } from './components/AboutScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { QuizScreen } from './components/QuizScreen';
import { ContactInfoScreen } from './components/ContactInfoScreen';
import { ResultScreen } from './components/ResultScreen';
import { RulerResultScreen } from './components/RulerResultScreen';
import { ConfessionsDashboard } from './components/ConfessionsDashboard';
import { SendConfession } from './components/SendConfession';

function useLocalStorage<T>(key: string, initialValue: T): [T, import('react').Dispatch<import('react').SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('dz_appState', 'welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage('dz_currentQuestionIndex', 0);
  const [userGender, setUserGender] = useLocalStorage<Gender>('dz_userGender', 'male');
  const [detailedAnswers, setDetailedAnswers] = useLocalStorage<{section: string, question: string, answerText: string, traitScored?: string}[]>('dz_detailedAnswers', []);
  const [contactInfo, setContactInfo] = useLocalStorage<string>('dz_contactInfo', '');
  const [nextStateAfterContact, setNextStateAfterContact] = useLocalStorage<AppState | null>('dz_nextStateAfterContact', null);
  const [justFinishedQuiz, setJustFinishedQuiz] = useLocalStorage<string | null>('dz_justFinishedQuiz', null);
  const [confessionRecipientId, setConfessionRecipientId] = useState<string | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sarahniId = urlParams.get('sarahni');
    const isAdmin = urlParams.get('admin');
    
    if (isAdmin === 'true') {
      setAppState('admin_dashboard');
    } else if (sarahniId) {
      setConfessionRecipientId(sarahniId);
      setAppState('send_confession');
    } else if (appState === 'send_confession') {
      setAppState('welcome');
    }
  }, [appState, setAppState]);

  const submitSingleTestResult = async (quizName: string, winningTraitName: string, info: string) => {
    try {
      const relevantAnswers = detailedAnswers.filter(a => a.section === quizName);
      const formattedAnswers = relevantAnswers
        .map((a, i) => `\${i + 1}. [\${a.section}] \${a.question}\n   => \${a.answerText}`)
        .join('\n\n');

      // Save to Firestore so the Admin Dashboard can read it
      await addDoc(collection(db, 'submissions'), {
        quizName,
        winningTraitName,
        contactInfo: info,
        answers: relevantAnswers,
        createdAt: serverTimestamp()
      }).catch(console.error);

    } catch (error) {
       console.error("Analytics: Error submitting test result:", error);
    }
  };

  // Marriage Readiness State
  const [marriageScores, setMarriageScores] = useLocalStorage<Record<MarriageReadinessId, number>>('dz_marriageScores', {
    ready: 0,
    career_focused: 0,
    hesitant: 0,
    traditional: 0,
    not_ready: 0,
  });
  const [resultMarriage, setResultMarriage] = useLocalStorage<MarriageReadinessId | null>('dz_resultMarriage', null);

  // Parenting Readiness State
  const [parentingScores, setParentingScores] = useLocalStorage<Record<ParentingReadinessId, number>>('dz_parentingScores', {
    eager: 0,
    planner: 0,
    hesitant: 0,
    childfree: 0,
  });
  const [resultParenting, setResultParenting] = useLocalStorage<ParentingReadinessId | null>('dz_resultParenting', null);
  
  // Personality State
  const [personalityScores, setPersonalityScores] = useLocalStorage<Record<PersonalityId, number>>('dz_personalityScores', {
    qafez: 0,
    falsafi: 0,
    niyya: 0,
    calme: 0,
  });
  const [resultPersonality, setResultPersonality] = useLocalStorage<PersonalityId | null>('dz_resultPersonality', null);

  // Political State
  const [politicalScores, setPoliticalScores] = useLocalStorage<Record<TribeId, number>>('dz_politicalScores', {
    guardian: 0,
    activist: 0,
    pragmatist: 0,
    reformer: 0,
  });
  const [resultTribe, setResultTribe] = useLocalStorage<TribeId | null>('dz_resultTribe', null);

  // Voting Style State
  const [votingScores, setVotingScores] = useLocalStorage<Record<VotingStyleId, number>>('dz_votingScores', {
    loyalist: 0,
    pragmatic_voter: 0,
    protester: 0,
    swing_voter: 0,
  });
  const [resultVotingStyle, setResultVotingStyle] = useLocalStorage<VotingStyleId | null>('dz_resultVotingStyle', null);

  // Ideology State
  const [ideologyScores, setIdeologyScores] = useLocalStorage<Record<IdeologyId, number>>('dz_ideologyScores', {
    conservative: 0,
    liberal: 0,
    socialist: 0,
    nationalist: 0,
  });
  const [resultIdeology, setResultIdeology] = useLocalStorage<IdeologyId | null>('dz_resultIdeology', null);

  // Ruler State
  const [rulerScores, setRulerScores] = useLocalStorage<Record<RulerId, number>>('dz_rulerScores', {
    iron_fist: 0,
    philosopher: 0,
    merchant: 0,
    populist: 0,
  });
  const [resultRuler, setResultRuler] = useLocalStorage<RulerId | null>('dz_resultRuler', null);

  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Restart Quizzes
  const startMarriageQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'marriage' && a.section !== 'setup'));
    setMarriageScores({ ready: 0, career_focused: 0, hesitant: 0, traditional: 0, not_ready: 0 });
    setCurrentQuestionIndex(0);
    setResultMarriage(null);
    setAppState('quiz_marriage');
  };

  const startParentingQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'parenting' && a.section !== 'setup'));
    setParentingScores({ eager: 0, planner: 0, hesitant: 0, childfree: 0 });
    setCurrentQuestionIndex(0);
    setResultParenting(null);
    setAppState('quiz_parenting');
  };

  const startPersonalityQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'personality' && a.section !== 'setup'));
    setPersonalityScores({ qafez: 0, falsafi: 0, niyya: 0, calme: 0 });
    setCurrentQuestionIndex(0);
    setResultPersonality(null);
    setAppState('quiz_personality');
  };

  const startPoliticalQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'political'));
    setPoliticalScores({ guardian: 0, activist: 0, pragmatist: 0, reformer: 0 });
    setCurrentQuestionIndex(0);
    setResultTribe(null);
    setAppState('quiz_political');
  };

  const startVotingQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'voting'));
    setVotingScores({ loyalist: 0, pragmatic_voter: 0, protester: 0, swing_voter: 0 });
    setCurrentQuestionIndex(0);
    setResultVotingStyle(null);
    setAppState('quiz_voting');
  };

  const startIdeologyQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'ideology'));
    setIdeologyScores({ conservative: 0, liberal: 0, socialist: 0, nationalist: 0 });
    setCurrentQuestionIndex(0);
    setResultIdeology(null);
    setAppState('quiz_ideology');
  };

  const startRulerQuiz = () => {
    setDetailedAnswers(prev => prev.filter(a => a.section !== 'ruler'));
    setRulerScores({ iron_fist: 0, philosopher: 0, merchant: 0, populist: 0 });
    setCurrentQuestionIndex(0);
    setResultRuler(null);
    setAppState('quiz_ruler');
  };

  const getNextPendingQuiz = () => {
    if (!resultMarriage) return { title: 'اختبار الاستعداد للزواج (الجزء 1)', start: startMarriageQuiz, colorName: 'bg-rose-600', hoverColorName: 'hover:bg-rose-500' };
    if (!resultParenting) return { title: 'الاستعداد للإنجاب (الجزء 2)', start: startParentingQuiz, colorName: 'bg-pink-600', hoverColorName: 'hover:bg-pink-500' };
    if (!resultPersonality) return { title: 'اكتشف شخصيتك (الجزء 3)', start: startPersonalityQuiz, colorName: 'bg-indigo-600', hoverColorName: 'hover:bg-indigo-500' };
    if (!resultIdeology) return { title: 'الأيديولوجية السياسية (الجزء 4)', start: startIdeologyQuiz, colorName: 'bg-amber-600', hoverColorName: 'hover:bg-amber-500' };
    if (!resultTribe) return { title: 'القبيلة السياسية (الجزء 5)', start: startPoliticalQuiz, colorName: 'bg-emerald-600', hoverColorName: 'hover:bg-emerald-500' };
    if (!resultVotingStyle) return { title: 'نمط التصويت (الجزء 6)', start: startVotingQuiz, colorName: 'bg-purple-600', hoverColorName: 'hover:bg-purple-500' };
    if (!resultRuler) return { title: 'الملك الحاكم (الجزء 7 والأخير)', start: startRulerQuiz, colorName: 'bg-blue-600', hoverColorName: 'hover:bg-blue-500' };
    return null;
  };



  const submitResults = async (
    marriage: MarriageReadinessId | null, 
    parenting: ParentingReadinessId | null,
    personality: PersonalityId | null, 
    politics: TribeId | null, 
    votingStyle: VotingStyleId | null, 
    ideology: IdeologyId | null, 
    ruler: RulerId | null, 
    info: string
  ) => {
    if (!marriage || !parenting || !personality || !politics || !votingStyle || !ideology || !ruler) return; // Only submit when all are complete
    
    try {
      await addDoc(collection(db, 'results'), {
        gender: userGender,
        marriage,
        parenting,
        personality,
        politics,
        votingStyle,
        ideology,
        ruler,
        detailedAnswers,
        contactInfo: info,
        createdAt: serverTimestamp(),
      });
      console.log("Analytics: Results saved successfully (DB).");

    } catch (error) {
      console.error("Analytics: Error saving results:", error);
    }
  };

  const handleMarriageAnswer = (answer: typeof MARRIAGE_QUESTIONS[0]['answers'][0]) => {
    if (MARRIAGE_QUESTIONS[currentQuestionIndex].isGenderQuestion && answer.genderValue) {
      setDetailedAnswers(prev => [...prev, { section: 'setup', question: getText(MARRIAGE_QUESTIONS[currentQuestionIndex].text, 'male'), answerText: getText(answer.text, 'male') }]);
      setUserGender(answer.genderValue);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    if (answer.trait) {
      const trait = answer.trait as MarriageReadinessId;
      setDetailedAnswers(prev => [...prev, { section: 'marriage', question: getText(MARRIAGE_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
      const newScores = { ...marriageScores, [trait]: marriageScores[trait] + 1 };
      setMarriageScores(newScores);

      if (currentQuestionIndex < MARRIAGE_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateMarriageResult(newScores);
      }
    }
  };

  const handleParentingAnswer = (answer: typeof PARENTING_QUESTIONS[0]['answers'][0]) => {
    if (answer.trait) {
      const trait = answer.trait as ParentingReadinessId;
      setDetailedAnswers(prev => [...prev, { section: 'parenting', question: getText(PARENTING_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
      const newScores = { ...parentingScores, [trait]: parentingScores[trait] + 1 };
      setParentingScores(newScores);

      if (currentQuestionIndex < PARENTING_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateParentingResult(newScores);
      }
    }
  };

  const handlePersonalityAnswer = (answer: typeof PERSONALITY_QUESTIONS[0]['answers'][0]) => {
    if (PERSONALITY_QUESTIONS[currentQuestionIndex].isGenderQuestion && answer.genderValue) {
      setDetailedAnswers(prev => [...prev, { section: 'setup', question: getText(PERSONALITY_QUESTIONS[currentQuestionIndex].text, 'male'), answerText: getText(answer.text, 'male') }]);
      setUserGender(answer.genderValue);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    if (answer.trait) {
      const trait = answer.trait as PersonalityId;
      setDetailedAnswers(prev => [...prev, { section: 'personality', question: getText(PERSONALITY_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
      const newScores = { ...personalityScores, [trait]: personalityScores[trait] + 1 };
      setPersonalityScores(newScores);

      if (currentQuestionIndex < PERSONALITY_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculatePersonalityResult(newScores);
      }
    }
  };

  const handlePoliticalAnswer = (answer: typeof POLITICAL_QUESTIONS[0]['answers'][0]) => {
    const trait = answer.trait as TribeId;
    setDetailedAnswers(prev => [...prev, { section: 'political', question: getText(POLITICAL_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
    const newScores = { ...politicalScores, [trait]: politicalScores[trait] + 1 };
    setPoliticalScores(newScores);

    if (currentQuestionIndex < POLITICAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculatePoliticalResult(newScores);
    }
  };

  const handleVotingAnswer = (answer: typeof VOTING_QUESTIONS[0]['answers'][0]) => {
     const trait = answer.trait as VotingStyleId;
     setDetailedAnswers(prev => [...prev, { section: 'voting', question: getText(VOTING_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
     const newScores = { ...votingScores, [trait]: votingScores[trait] + 1 };
     setVotingScores(newScores);

     if (currentQuestionIndex < VOTING_QUESTIONS.length - 1) {
       setCurrentQuestionIndex(currentQuestionIndex + 1);
     } else {
       calculateVotingResult(newScores);
     }
  };

  const handleIdeologyAnswer = (answer: typeof IDEOLOGY_QUESTIONS[0]['answers'][0]) => {
    const trait = answer.trait as IdeologyId;
    setDetailedAnswers(prev => [...prev, { section: 'ideology', question: getText(IDEOLOGY_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
    const newScores = { ...ideologyScores, [trait]: ideologyScores[trait] + 1 };
    setIdeologyScores(newScores);

    if (currentQuestionIndex < IDEOLOGY_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateIdeologyResult(newScores);
    }
  };

  const handleRulerAnswer = (answer: typeof RULER_QUESTIONS[0]['answers'][0]) => {
    const trait = answer.trait as RulerId;
    setDetailedAnswers(prev => [...prev, { section: 'ruler', question: getText(RULER_QUESTIONS[currentQuestionIndex].text, userGender), answerText: getText(answer.text, userGender), traitScored: trait }]);
    const newScores = { ...rulerScores, [trait]: rulerScores[trait] + 1 };
    setRulerScores(newScores);

    if (currentQuestionIndex < RULER_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateRulerResult(newScores);
    }
  };

  const calculateMarriageResult = (finalScores: Record<MarriageReadinessId, number>) => {
    let maxScore = 0;
    let winningTrait: MarriageReadinessId = 'ready';
    (Object.keys(finalScores) as MarriageReadinessId[]).forEach((trait) => {
      if (finalScores[trait] > maxScore) {
        maxScore = finalScores[trait];
        winningTrait = trait;
      }
    });

    setResultMarriage(winningTrait);
    addDoc(collection(db, 'results'), { quizCategory: 'marriage', traitId: winningTrait, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_marriage');
      setJustFinishedQuiz('marriage');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('marriage', getText(MARRIAGE_READINESS[winningTrait].name, userGender), contactInfo);
      setAppState('result_marriage');
    }
  };

  const calculateParentingResult = (finalScores: Record<ParentingReadinessId, number>) => {
    let maxScore = 0;
    let winningTrait: ParentingReadinessId = 'eager';
    (Object.keys(finalScores) as ParentingReadinessId[]).forEach((trait) => {
      if (finalScores[trait] > maxScore) {
        maxScore = finalScores[trait];
        winningTrait = trait;
      }
    });

    setResultParenting(winningTrait);
    addDoc(collection(db, 'results'), { quizCategory: 'parenting', traitId: winningTrait, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_parenting');
      setJustFinishedQuiz('parenting');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('parenting', getText(PARENTING_READINESS[winningTrait].name, userGender), contactInfo);
      setAppState('result_parenting');
    }
  };

  const calculatePersonalityResult = (finalScores: Record<PersonalityId, number>) => {
    let maxScore = 0;
    let winningTrait: PersonalityId = 'calme';

    (Object.entries(finalScores) as [PersonalityId, number][]).forEach(([trait, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winningTrait = trait;
      }
    });

    setResultPersonality(winningTrait);
    addDoc(collection(db, 'results'), { quizCategory: 'personality', personality: winningTrait, traitId: winningTrait, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_personality');
      setJustFinishedQuiz('personality');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('personality', getText(PERSONALITIES[winningTrait].name, userGender), contactInfo);
      setAppState('result_personality');
    }
  };

  const calculatePoliticalResult = (finalScores: Record<TribeId, number>) => {
    let maxScore = 0;
    let winningTribe: TribeId = 'guardian';

    (Object.entries(finalScores) as [TribeId, number][]).forEach(([tribe, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winningTribe = tribe;
      }
    });

    setResultTribe(winningTribe);
    addDoc(collection(db, 'results'), { quizCategory: 'political', traitId: winningTribe, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_political');
      setJustFinishedQuiz('political');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('political', getText(TRIBES[winningTribe].name, userGender), contactInfo);
      setAppState('result_political');
    }
  };

  const calculateVotingResult = (finalScores: Record<VotingStyleId, number>) => {
    let maxScore = 0;
    let winningStyle: VotingStyleId = 'swing_voter';

    (Object.entries(finalScores) as [VotingStyleId, number][]).forEach(([style, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winningStyle = style;
      }
    });

    setResultVotingStyle(winningStyle);
    addDoc(collection(db, 'results'), { quizCategory: 'voting', traitId: winningStyle, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_voting');
      setJustFinishedQuiz('voting');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('voting', getText(VOTING_STYLES[winningStyle].name, userGender), contactInfo);
      setAppState('result_voting');
    }
  };

  const calculateIdeologyResult = (finalScores: Record<IdeologyId, number>) => {
    let maxScore = 0;
    let winningIdeology: IdeologyId = 'conservative';

    (Object.entries(finalScores) as [IdeologyId, number][]).forEach(([ideology, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winningIdeology = ideology;
      }
    });

    setResultIdeology(winningIdeology);
    addDoc(collection(db, 'results'), { quizCategory: 'ideology', traitId: winningIdeology, createdAt: serverTimestamp() }).catch(console.error);
    if (!contactInfo) {
      setNextStateAfterContact('result_ideology');
      setJustFinishedQuiz('ideology');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('ideology', getText(IDEOLOGIES[winningIdeology].name, userGender), contactInfo);
      setAppState('result_ideology');
    }
  };

  const calculateRulerResult = (finalScores: Record<RulerId, number>) => {
    let maxScore = 0;
    let winningRuler: RulerId = 'philosopher';

    (Object.entries(finalScores) as [RulerId, number][]).forEach(([ruler, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winningRuler = ruler;
      }
    });

    setResultRuler(winningRuler);
    addDoc(collection(db, 'results'), { quizCategory: 'ruler', traitId: winningRuler, createdAt: serverTimestamp() }).catch(console.error);
    
    // Always trigger final submission for full profile
    submitResults(resultMarriage, resultParenting, resultPersonality, resultTribe, resultVotingStyle, resultIdeology, winningRuler, contactInfo);
    
    if (!contactInfo) {
      setNextStateAfterContact('result_ruler');
      setJustFinishedQuiz('ruler');
      setAppState('contact_info');
    } else {
      submitSingleTestResult('ruler', getText(RULERS[winningRuler].name, userGender), contactInfo);
      setAppState('result_ruler');
    }
  };

  const shareResultImage = async (platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'download', title: string, description: string) => {
    if (!resultCardRef.current) return;
    
    try {
      setIsGeneratingImage(true);
      // Wait for layout shift (e.g. dimensions for instagram story)
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const dataUrl = await toPng(resultCardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        style: { background: '#0a0a0a' }
      }); 
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'compass-result.png', { type: 'image/png' });
      const canShareFile = navigator.canShare && navigator.canShare({ files: [file] });
         
      if (platform === 'download') {
        const link = document.createElement('a');
        link.download = `my-political-compass-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        alert('✅ تم تحميل الصورة بنجاح!');
      } else {
        if (canShareFile) {
           const shareData: ShareData = { files: [file] };
           // Only add text if not specifically trying to post a clean image story
           if (platform === 'facebook' || platform === 'twitter' || platform === 'whatsapp') {
               shareData.title = 'بوصلة السياسة الجزائرية';
               shareData.text = `اكتشفت نتيجتي في ${title} 🇩🇿 جرب الاختبار وشارك نتيجتك 👇\n` + window.location.href;
           }
           await navigator.share(shareData);
        } else {
           // Fallback when Web Share target doesn't allow files
           const link = document.createElement('a');
           link.download = `my-political-compass-${Date.now()}.png`;
           link.href = dataUrl;
           link.click();
           if (platform === 'instagram') {
              alert('عذراً، متصفحك لا يدعم المشاركة المباشرة للتطبيقات.\n\n✅ تم حفظ الصورة في هاتفك!\n\nافتح الآن تطبيق انستغرام وقم باختيار الصورة من المعرض لنشرها في الـ Story الخاصة بك.');
           } else {
              alert('✅ تم تحميل الصورة بنجاح! يمكنك الآن مشاركتها في حسابك.');
           }
        }
      }
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('عذراً، حدث خطأ أثناء إنشاء الصورة.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareToFacebook = (title: string, description: string) => {
    const url = window.location.href;
    const quote = `حصلت على نتيجة: ${title} - ${description} اكتشف نفسك أنت أيضاً!`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`,
      'facebook-share-dialog',
      'width=800,height=600'
    );
  };

  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Zap': return <Zap className={className} />;
      case 'Search': return <Search className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'HelpCircle': return <HelpCircle className={className} />;
      case 'Home': return <Home className={className} />;
      case 'XCircle': return <XCircle className={className} />;
      default: return <Brain className={className} />;
    }
  };

  const pendingQuiz = getNextPendingQuiz();

  const handleContactSubmit = (info: string) => {
    if (justFinishedQuiz) {
       let traitValue = '';
       switch(justFinishedQuiz) {
          case 'marriage': traitValue = resultMarriage ? getText(MARRIAGE_READINESS[resultMarriage].name, userGender) : ''; break;
          case 'parenting': traitValue = resultParenting ? getText(PARENTING_READINESS[resultParenting].name, userGender) : ''; break;
          case 'personality': traitValue = resultPersonality ? getText(PERSONALITIES[resultPersonality].name, userGender) : ''; break;
          case 'political': traitValue = resultTribe ? getText(TRIBES[resultTribe].name, userGender) : ''; break;
          case 'voting': traitValue = resultVotingStyle ? getText(VOTING_STYLES[resultVotingStyle].name, userGender) : ''; break;
          case 'ideology': traitValue = resultIdeology ? getText(IDEOLOGIES[resultIdeology].name, userGender) : ''; break;
          case 'ruler': traitValue = resultRuler ? getText(RULERS[resultRuler].name, userGender) : ''; break;
       }
       submitSingleTestResult(justFinishedQuiz, traitValue, info);
    }
    if (nextStateAfterContact) {
      setAppState(nextStateAfterContact);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center py-6 sm:py-12 px-3 sm:px-4 bg-zinc-950 text-gray-100 overflow-y-auto overflow-x-hidden relative">
      
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-indigo-900 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <main className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* WELCOME SCREEN */}
          {appState === 'welcome' && (
            <WelcomeScreen
              setAppState={setAppState}
              startMarriageQuiz={startMarriageQuiz}
              startPersonalityQuiz={startPersonalityQuiz}
              startPoliticalQuiz={startPoliticalQuiz}
              startIdeologyQuiz={startIdeologyQuiz}
              startVotingQuiz={startVotingQuiz}
              startRulerQuiz={startRulerQuiz}
              resultMarriage={resultMarriage}
              resultPersonality={resultPersonality}
              resultTribe={resultTribe}
              resultIdeology={resultIdeology}
              resultVotingStyle={resultVotingStyle}
              resultRuler={resultRuler}
              showInstallPrompt={showInstallPrompt}
              onInstallClick={handleInstallClick}
            />
          )}

          {/* ABOUT SCREEN */}
          {appState === 'about' && (
            <AboutScreen onBack={() => setAppState('welcome')} />
          )}

          {/* ADMIN DASHBOARD */}
          {appState === 'admin_dashboard' && (
             <AdminDashboard setAppState={setAppState} />
          )}

          {/* CONFESSIONS DASHBOARD */}
          {appState === 'confessions_dashboard' && (
            <ConfessionsDashboard onBack={() => setAppState('welcome')} />
          )}

          {/* SEND CONFESSION */}
          {appState === 'send_confession' && confessionRecipientId && (
            <SendConfession 
               recipientId={confessionRecipientId} 
               onMakeOwn={() => {
                  window.history.replaceState({}, '', window.location.pathname);
                  setAppState('welcome');
               }} 
            />
          )}

          {/* CONTACT INFO SCREEN */}
          {appState === 'contact_info' && (
            <ContactInfoScreen
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              onSubmit={() => handleContactSubmit(contactInfo)}
              onSkip={() => handleContactSubmit('')}
            />
          )}

          {/* MARRIAGE QUIZ SCREEN */}
          {appState === 'quiz_marriage' && (
            <QuizScreen
              quizKey="quiz_marriage"
              title="اختبار الاستعداد للزواج"
              questions={MARRIAGE_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handleMarriageAnswer}
              colorClass="text-rose-400"
              colorHex="from-rose-600 to-pink-500"
              colorBorderClass="border-rose-500/20"
              colorBgClass="bg-rose-400"
            />
          )}

          {/* MARRIAGE Result */}
          {appState === 'result_marriage' && resultMarriage && (
            <ResultScreen
              resultKey="result_marriage"
              resultCardRef={resultCardRef}
              isGeneratingImage={isGeneratingImage}
              color={MARRIAGE_READINESS[resultMarriage].color}
              largeIcon={renderIcon(MARRIAGE_READINESS[resultMarriage].icon, "w-64 h-64")}
              smallIcon={renderIcon(MARRIAGE_READINESS[resultMarriage].icon, "w-16 h-16")}
              title="نتيجة اختبار الزواج"
              subTitle="فيما يخص بناء أسرة، أنت:"
              name={getText(MARRIAGE_READINESS[resultMarriage].name, userGender!)}
              description={getText(MARRIAGE_READINESS[resultMarriage].description, userGender!)}
              pendingQuiz={pendingQuiz}
              quizCategory="marriage"
              userTraitId={resultMarriage}
              allTraits={MARRIAGE_READINESS}
              userGender={userGender!}
              onShareFacebook={() => shareResultImage('facebook', "الاستعداد للزواج", "في بوصلة المجتمع الجزائري")}
              onShareInstagram={() => shareResultImage('instagram', "الاستعداد للزواج", "في بوصلة المجتمع الجزائري")}
              onShareTwitter={() => shareResultImage('twitter', "الاستعداد للزواج", "في بوصلة المجتمع الجزائري")}
              onShareWhatsApp={() => shareResultImage('whatsapp', "الاستعداد للزواج", "في بوصلة المجتمع الجزائري")}
              onHome={() => setAppState('welcome')}
              onFullProfile={(resultPersonality && resultTribe && resultVotingStyle && resultIdeology && resultRuler) ? () => setAppState('result_ruler') : undefined}
            />
          )}

          {/* PARENTING QUIZ SCREEN */}
          {appState === 'quiz_parenting' && (
            <QuizScreen
              quizKey="quiz_parenting"
              title="الاستعداد للإنجاب"
              partText="الجزء 2: الاستعداد للإنجاب"
              questions={PARENTING_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handleParentingAnswer}
              colorClass="text-pink-400"
              colorHex="from-pink-600 to-rose-400"
              colorBorderClass="border-pink-500/20"
              colorBgClass="bg-pink-500"
            />
          )}

          {/* PARENTING Result */}
          {appState === 'result_parenting' && resultParenting && (
             <ResultScreen
               resultKey="result_parenting"
               resultCardRef={resultCardRef}
               isGeneratingImage={isGeneratingImage}
               color={PARENTING_READINESS[resultParenting].color}
               largeIcon={renderIcon(PARENTING_READINESS[resultParenting].icon, "w-64 h-64")}
               smallIcon={renderIcon(PARENTING_READINESS[resultParenting].icon, "w-16 h-16")}
               title="نتيجة اختبار الاستعداد للإنجاب"
               subTitle="بالنسبة لتكوين أسرة وإنجاب أطفال، تبدو:"
               name={getText(PARENTING_READINESS[resultParenting].name, userGender!)}
               description={getText(PARENTING_READINESS[resultParenting].description, userGender!)}
               pendingQuiz={pendingQuiz}
               nextButtonLabel="استمر للاختبار التالي"
               quizCategory="parenting"
               userTraitId={resultParenting}
               allTraits={PARENTING_READINESS}
               userGender={userGender!}
               onShareFacebook={() => shareResultImage('facebook', "الاستعداد للإنجاب", "في بوصلة المجتمع الجزائري")}
               onShareInstagram={() => shareResultImage('instagram', "الاستعداد للإنجاب", "في بوصلة المجتمع الجزائري")}
               onShareTwitter={() => shareResultImage('twitter', "الاستعداد للإنجاب", "في بوصلة المجتمع الجزائري")}
               onShareWhatsApp={() => shareResultImage('whatsapp', "الاستعداد للإنجاب", "في بوصلة المجتمع الجزائري")}
               onHome={() => setAppState('welcome')}
               onFullProfile={(resultPersonality && resultTribe && resultVotingStyle && resultIdeology && resultRuler) ? () => setAppState('result_ruler') : undefined}
             />
          )}

          {/* PERSONALITY QUIZ SCREEN */}
          {appState === 'quiz_personality' && (
            <QuizScreen
              quizKey="quiz_personality"
              title="الشخصية"
              partText="الجزء الأول: الشخصية"
              questions={PERSONALITY_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handlePersonalityAnswer}
              colorClass="text-indigo-400"
              colorHex="from-indigo-600 to-purple-500"
              colorBorderClass="border-indigo-500/20"
              colorBgClass="bg-indigo-400"
            />
          )}

          {/* Personality Result */}
          {appState === 'result_personality' && resultPersonality && (
             <ResultScreen
               resultKey="result_personality"
               resultCardRef={resultCardRef}
               isGeneratingImage={isGeneratingImage}
               color={PERSONALITIES[resultPersonality].color}
               largeIcon={renderIcon(PERSONALITIES[resultPersonality].icon, "w-64 h-64")}
               smallIcon={renderIcon(PERSONALITIES[resultPersonality].icon, "w-16 h-16")}
               title="انتهى الاختبار الأول"
               subTitle="أنت تمتلك شخصية:"
               name={getText(PERSONALITIES[resultPersonality].name, userGender!)}
               description={getText(PERSONALITIES[resultPersonality].description, userGender!)}
               pendingQuiz={pendingQuiz}
               quizCategory="personality"
               userTraitId={resultPersonality}
               allTraits={PERSONALITIES}
               userGender={userGender!}
               onShareFacebook={() => shareResultImage('facebook', "اختبار الشخصية", "في بوصلة السياسة الجزائرية")}
               onShareInstagram={() => shareResultImage('instagram', "اختبار الشخصية", "في بوصلة السياسة الجزائرية")}
               onShareTwitter={() => shareResultImage('twitter', "اختبار الشخصية", "في بوصلة السياسة الجزائرية")}
               onShareWhatsApp={() => shareResultImage('whatsapp', "اختبار الشخصية", "في بوصلة السياسة الجزائرية")}
               onHome={() => setAppState('welcome')}
               onFullProfile={!pendingQuiz ? () => setAppState('result_ruler') : undefined}
             />
          )}

          {/* POLITICAL QUIZ SCREEN */}
          {appState === 'quiz_political' && (
            <QuizScreen
              quizKey="quiz_political"
              title="القبيلة السياسية"
              partText="الجزء الثالث: القبيلة السياسية"
              questions={POLITICAL_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handlePoliticalAnswer}
              colorClass="text-emerald-400"
              colorHex="from-emerald-600 to-teal-500"
              colorBorderClass="border-emerald-500/20"
              colorBgClass="bg-emerald-400"
            />
          )}

          {/* POLITICAL RESULT SCREEN */}
          {appState === 'result_political' && resultTribe && (
            <ResultScreen
              resultKey="result_political"
              resultCardRef={resultCardRef}
              isGeneratingImage={isGeneratingImage}
              color={TRIBES[resultTribe].color}
              largeIcon={renderIcon(TRIBES[resultTribe].icon, "w-64 h-64")}
              smallIcon={renderIcon(TRIBES[resultTribe].icon, "w-16 h-16")}
              title="نتيجة الجزء الثالث"
              subTitle="قبيلتك السياسية هي:"
              name={getText(TRIBES[resultTribe].name, userGender!)}
              description={getText(TRIBES[resultTribe].description, userGender!)}
              pendingQuiz={pendingQuiz}
              quizCategory="political"
              userTraitId={resultTribe}
              allTraits={TRIBES}
              userGender={userGender!}
              onShareFacebook={() => shareResultImage('facebook', "القبيلة السياسية", "في بوصلة السياسة الجزائرية")}
              onShareInstagram={() => shareResultImage('instagram', "القبيلة السياسية", "في بوصلة السياسة الجزائرية")}
              onShareTwitter={() => shareResultImage('twitter', "القبيلة السياسية", "في بوصلة السياسة الجزائرية")}
              onShareWhatsApp={() => shareResultImage('whatsapp', "القبيلة السياسية", "في بوصلة السياسة الجزائرية")}
              onHome={() => setAppState('welcome')}
              onFullProfile={!pendingQuiz ? () => setAppState('result_ruler') : undefined}
            >
              {resultPersonality && (
                <div className="inline-block bg-white/5 mx-auto px-6 py-3 rounded-full border border-white/10 text-sm text-gray-300">
                  شخصيتك: <strong className="text-white">{getText(PERSONALITIES[resultPersonality].name, userGender!)}</strong> | قبيلتك: <strong className="text-white">{getText(TRIBES[resultTribe].name, userGender!)}</strong>
                </div>
              )}
            </ResultScreen>
          )}

          {/* VOTING QUIZ SCREEN */}
          {appState === 'quiz_voting' && (
            <QuizScreen
              quizKey="quiz_voting"
              title="نمط التصويت"
              partText="الجزء الرابع: نمط التصويت"
              questions={VOTING_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handleVotingAnswer}
              colorClass="text-pink-400"
              colorHex="from-purple-400 to-pink-500"
              colorBorderClass="border-pink-400/20"
              colorBgClass="bg-pink-400"
            />
          )}

          {/* VOTING RESULT SCREEN */}
          {appState === 'result_voting' && resultVotingStyle && (
            <ResultScreen
              resultKey="result_voting"
              resultCardRef={resultCardRef}
              isGeneratingImage={isGeneratingImage}
              color={VOTING_STYLES[resultVotingStyle].color}
              largeIcon={renderIcon(VOTING_STYLES[resultVotingStyle].icon, "w-64 h-64")}
              smallIcon={renderIcon(VOTING_STYLES[resultVotingStyle].icon, "w-16 h-16")}
              title="نتيجة الجزء الرابع"
              subTitle="أسلوبك في التصويت هو:"
              name={getText(VOTING_STYLES[resultVotingStyle].name, userGender!)}
              description={getText(VOTING_STYLES[resultVotingStyle].description, userGender!)}
              pendingQuiz={pendingQuiz}
              quizCategory="voting"
              userTraitId={resultVotingStyle}
              allTraits={VOTING_STYLES}
              userGender={userGender!}
              onShareFacebook={() => shareResultImage('facebook', "أسلوب التصويت", "في بوصلة السياسة الجزائرية")}
              onShareInstagram={() => shareResultImage('instagram', "أسلوب التصويت", "في بوصلة السياسة الجزائرية")}
              onShareTwitter={() => shareResultImage('twitter', "أسلوب التصويت", "في بوصلة السياسة الجزائرية")}
              onShareWhatsApp={() => shareResultImage('whatsapp', "أسلوب التصويت", "في بوصلة السياسة الجزائرية")}
              onHome={() => setAppState('welcome')}
              onFullProfile={!pendingQuiz ? () => setAppState('result_ruler') : undefined}
            >
              {(resultPersonality && resultTribe) && (
                <div className="inline-block bg-white/5 mx-auto px-6 py-3 border border-white/10 text-sm text-gray-300">
                  <p className="mb-2">شخصيتك: <strong className="text-white">{getText(PERSONALITIES[resultPersonality].name, userGender!)}</strong></p>
                  <p>قبيلتك: <strong className="text-white">{getText(TRIBES[resultTribe].name, userGender!)}</strong></p>
                </div>
              )}
            </ResultScreen>
          )}

        {/* IDEOLOGY QUIZ SCREEN */}
          {appState === 'quiz_ideology' && (
            <QuizScreen
              quizKey="quiz_ideology"
              title="الأيديولوجية السياسية"
              partText="الجزء الثاني: الأيديولوجية السياسية"
              questions={IDEOLOGY_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handleIdeologyAnswer}
              colorClass="text-amber-400"
              colorHex="from-red-400 to-amber-500"
              colorBorderClass="border-amber-400/20"
              colorBgClass="bg-amber-400"
            />
          )}

          {/* IDEOLOGY RESULT SCREEN */}
          {appState === 'result_ideology' && resultIdeology && (
            <ResultScreen
              resultKey="result_ideology"
              resultCardRef={resultCardRef}
              isGeneratingImage={isGeneratingImage}
              color={IDEOLOGIES[resultIdeology].color}
              largeIcon={renderIcon(IDEOLOGIES[resultIdeology].icon, "w-64 h-64")}
              smallIcon={renderIcon(IDEOLOGIES[resultIdeology].icon, "w-16 h-16")}
              title="نتيجة الجزء الثاني"
              subTitle="أيديولوجيتك العميقة هي:"
              name={getText(IDEOLOGIES[resultIdeology].name, userGender!)}
              description={getText(IDEOLOGIES[resultIdeology].description, userGender!)}
              pendingQuiz={pendingQuiz}
              quizCategory="ideology"
              userTraitId={resultIdeology}
              allTraits={IDEOLOGIES}
              userGender={userGender!}
              onShareFacebook={() => shareResultImage('facebook', "الأيديولوجية السياسية", "في بوصلة السياسة الجزائرية")}
              onShareInstagram={() => shareResultImage('instagram', "الأيديولوجية السياسية", "في بوصلة السياسة الجزائرية")}
              onShareTwitter={() => shareResultImage('twitter', "الأيديولوجية السياسية", "في بوصلة السياسة الجزائرية")}
              onShareWhatsApp={() => shareResultImage('whatsapp', "الأيديولوجية السياسية", "في بوصلة السياسة الجزائرية")}
              onHome={() => setAppState('welcome')}
              onFullProfile={!pendingQuiz ? () => setAppState('result_ruler') : undefined}
            >
              {/* Political Compass Graph */}
              <div className="w-full max-w-md mx-auto aspect-square relative bg-zinc-900/50 rounded-2xl border border-white/10 p-4 mb-6">
                <div className="absolute inset-0 m-8 border-2 border-white/20 rounded-xl overflow-hidden shadow-inset">
                  {/* Grid lines */}
                  <div className="absolute top-1/2 left-0 w-full h-px bg-white/30" />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
                  
                  {/* Quadrant Colors */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/10" />
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/10" />
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-500/10" />
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-500/10" />

                  {/* Labels */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400">سلطوي</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400">تحرري</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 origin-right">يمين</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 origin-left">يسار</span>

                  {/* User Point */}
                  <motion.div 
                    className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-white z-10 ${
                      resultIdeology === 'conservative' ? 'top-1/4 right-1/4 bg-amber-500' :
                      resultIdeology === 'liberal' ? 'bottom-1/4 right-1/4 bg-yellow-400' :
                      resultIdeology === 'socialist' ? 'bottom-1/4 left-1/4 bg-red-500' :
                      'top-1/4 left-1/4 bg-emerald-500'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  />
                </div>
              </div>
            </ResultScreen>
          )}

          {/* RULER QUIZ SCREEN */}
          {appState === 'quiz_ruler' && (
            <QuizScreen
              quizKey="quiz_ruler"
              title="الحاكم المثالي"
              partText="الجزء الخامس والأخير: من يحكمك؟"
              questions={RULER_QUESTIONS}
              currentIndex={currentQuestionIndex}
              userGender={userGender}
              onAnswer={handleRulerAnswer}
              colorClass="text-yellow-400"
              colorHex="from-yellow-600 to-orange-500"
              colorBorderClass="border-yellow-500/20"
              colorBgClass="bg-yellow-400"
            />
          )}

          {/* RULER RESULT SCREEN (FINAL) */}
          {appState === 'result_ruler' && resultRuler && (
            <RulerResultScreen
              resultCardRef={resultCardRef}
              isGeneratingImage={isGeneratingImage}
              userGender={userGender!}
              resultRuler={resultRuler}
              resultMarriage={resultMarriage}
              resultParenting={resultParenting}
              resultPersonality={resultPersonality}
              resultTribe={resultTribe}
              resultVotingStyle={resultVotingStyle}
              resultIdeology={resultIdeology}
              pendingQuiz={pendingQuiz}
              renderIcon={renderIcon}
              onShare={shareResultImage}
              onRestart={() => setAppState('welcome')}
            />
          )}

          </AnimatePresence>
      </main>
      
      {/* Footer minimal */}
      {appState === 'welcome' && (
        <div className="absolute bottom-6 w-full text-center text-sm text-gray-500 font-medium">
          أنا شكون؟ © 2026
        </div>
      )}

      {/* Full-screen Loading Overlay during image generation */}
      {isGeneratingImage && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
          <Activity className="w-16 h-16 text-indigo-500 animate-pulse mb-6" />
          <div className="text-2xl text-white font-black tracking-wider drop-shadow-lg">جاري تحضير صورتك الأنيقة...</div>
          <p className="text-gray-400 mt-3 font-medium">يرجى الانتظار لحظات</p>
        </div>
      )}
    </div>
  );
}

