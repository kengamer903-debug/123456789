import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { SCENES, QUIZ_DATA, GUIDE_STEPS } from './data';
import VisualStage from './components/VisualStage';
import { 
  ChevronRight, ChevronLeft, Info, PlayCircle, Volume2, VolumeX, RotateCcw, 
  Play, Pause, Captions, Globe, Activity, Beaker, HelpCircle, ArrowDown, 
  RotateCw, Layers, Box, X, MousePointerClick, CheckCircle, Construction, AlertTriangle,
  TrendingUp, AlertOctagon, Upload
} from 'lucide-react';
import { Language, AppMode, SimState, SoilType } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAudio, getAudio } from './utils/db';

// --- UI Translation Dictionary ---
const UI_TEXT = {
  th: {
    engineeringVisualizer: "แบบจำลองวิศวกรรม",
    storyMode: "โหมดเนื้อเรื่อง",
    labSim: "ห้องทดลอง",
    quizMode: "แบบทดสอบ",
    phaseDrill: "ขั้นตอนที่ 1: การเจาะ",
    phaseGrout: "ขั้นตอนที่ 2: การอัดฉีด",
    phaseDone: "การทำงานเสร็จสมบูรณ์",
    phaseFail: "เกิดข้อผิดพลาด!",
    instrDrill: "กดปุ่มค้างไว้เพื่อเจาะท่อลงดิน",
    instrGrout: "กดปุ่มค้างไว้เพื่ออัดฉีดซีเมนต์และยกโครงสร้าง",
    instrDone: "เสร็จสิ้นขั้นตอน กดรีเซ็ตเพื่อเริ่มใหม่",
    instrFail: "การทำงานล้มเหลว ตรวจสอบความปลอดภัย",
    depthLevel: "ระดับความลึก",
    pressure: "แรงดัน (Pressure)",
    heave: "การยกตัวของโครงสร้าง (Heave)",
    holdDrill: "กดค้างเพื่อเจาะ",
    holdPump: "กดค้างเพื่ออัดฉีด",
    resetSystem: "เริ่มใหม่",
    soilType: "ประเภทดิน",
    tryAgain: "ลองอีกครั้ง",
    back: "ย้อนกลับ",
    nextScene: "ฉากถัดไป",
    finish: "จบการนำเสนอ",
    scene: "ฉาก",
    criticalIssue: "ปัญหาเร่งด่วน",
    solutionActive: "กำลังแก้ไข",
    simTitle: "Construction Sim",
    selectLanguage: "เลือกภาษา",
    question: "คำถาม",
    score: "คะแนน",
    quizCompleted: "ทำแบบทดสอบเสร็จสิ้น",
    finalScore: "คะแนนรวม",
    startTour: "แนะนำการใช้งาน",
    failBlowout: "ดินระเบิด (Blowout)!",
    failDamage: "โครงสร้างเสียหาย (Over-lift)!"
  },
  en: {
    engineeringVisualizer: "Engineering Visualizer",
    storyMode: "Story",
    labSim: "Lab Sim",
    quizMode: "Quiz",
    phaseDrill: "Phase 1: Drilling",
    phaseGrout: "Phase 2: Grouting",
    phaseDone: "Operation Complete",
    phaseFail: "Operation Failed!",
    instrDrill: "Hold button to insert casing pipe.",
    instrGrout: "Hold button to inject grout & lift.",
    instrDone: "Process finished. Reset to start over.",
    instrFail: "Safety limit exceeded. Check parameters.",
    depthLevel: "Depth Level",
    pressure: "Pressure",
    heave: "Structural Lift (Heave)",
    holdDrill: "HOLD TO DRILL",
    holdPump: "HOLD TO PUMP",
    resetSystem: "Reset System",
    soilType: "Soil Type",
    tryAgain: "Try Again",
    back: "Back",
    nextScene: "Next Scene",
    finish: "Finish",
    scene: "Scene",
    criticalIssue: "Critical Issue",
    solutionActive: "Solution Active",
    simTitle: "Construction Sim",
    selectLanguage: "Select Language",
    question: "Question",
    score: "Score",
    quizCompleted: "Quiz Completed",
    finalScore: "Final Score",
    startTour: "Start Guide",
    failBlowout: "Soil Blowout!",
    failDamage: "Structural Damage!"
  },
  zh: {
    engineeringVisualizer: "工程可视化",
    storyMode: "故事模式",
    labSim: "实验室模拟",
    quizMode: "测验模式",
    phaseDrill: "第一阶段：钻孔",
    phaseGrout: "第二阶段：注浆",
    phaseDone: "操作完成",
    phaseFail: "操作失败！",
    instrDrill: "按住按钮插入套管。",
    instrGrout: "按住按钮注浆并抬升。",
    instrDone: "流程结束。重置以重新开始。",
    instrFail: "超出安全限制。检查参数。",
    depthLevel: "深度",
    pressure: "压力",
    heave: "结构抬升 (Heave)",
    holdDrill: "按住钻孔",
    holdPump: "按住注浆",
    resetSystem: "重置系统",
    soilType: "土壤类型",
    tryAgain: "重试",
    back: "返回",
    nextScene: "下一幕",
    finish: "完成",
    scene: "场景",
    criticalIssue: "关键问题",
    solutionActive: "解决方案激活",
    simTitle: "施工模拟",
    selectLanguage: "选择语言",
    question: "问题",
    score: "得分",
    quizCompleted: "测验完成",
    finalScore: "最终得分",
    startTour: "开始引导",
    failBlowout: "土壤喷出 (Blowout)!",
    failDamage: "结构损坏!"
  }
};

// --- Tour Guide Component ---
interface TourGuideProps {
  stepIndex: number;
  language: Language;
  onNext: () => void;
  onClose: () => void;
}

const TourGuide: React.FC<TourGuideProps> = ({ stepIndex, language, onNext, onClose }) => {
  const step = GUIDE_STEPS[stepIndex];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure target element position
  useLayoutEffect(() => {
    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };
    
    // Slight delay to allow for tab switching/rendering
    setTimeout(updateRect, 100);
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [step.targetId]);

  if (!targetRect) return null;

  // Calculate position for the popup
  const isSmallScreen = window.innerWidth < 768;
  const isRightSide = targetRect.left > window.innerWidth / 2;
  
  const popupStyle: React.CSSProperties = isSmallScreen 
    ? { bottom: '20px', left: '20px', right: '20px' } 
    : { 
        top: Math.min(targetRect.bottom + 10, window.innerHeight - 200),
        left: isRightSide ? targetRect.left - 320 : targetRect.right + 20,
        maxWidth: '300px'
      };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 transition-all duration-500" />

      {/* Highlighter Box - Industrial Style */}
      <motion.div
        layoutId="tour-highlight"
        className="absolute border-4 border-orange-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        initial={false}
        animate={{
          top: targetRect.top - 5,
          left: targetRect.left - 5,
          width: targetRect.width + 10,
          height: targetRect.height + 10,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Info Card - Construction Theme */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={stepIndex}
        className="absolute bg-white p-6 shadow-2xl pointer-events-auto flex flex-col gap-3 border-l-4 border-orange-500"
        style={popupStyle}
      >
        <div className="flex justify-between items-start">
           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 uppercase tracking-tight">
             <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center text-xs font-mono">
               {stepIndex + 1}
             </span>
             {step.title[language]}
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-red-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-2">
          {step.description[language]}
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button 
             onClick={onNext}
             className="px-4 py-2 bg-slate-900 text-white text-sm font-bold shadow hover:bg-slate-800 flex items-center gap-2 uppercase tracking-wide"
          >
             {stepIndex < GUIDE_STEPS.length - 1 ? 'Next Step' : 'Finish'} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [customAudioMap, setCustomAudioMap] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  
  // App Mode State
  const [mode, setMode] = useState<AppMode>('STORY');
  
  // Tour Guide State
  const [showTour, setShowTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Simulation State
  const [simState, setSimState] = useState<SimState>({
    drillDepth: 0,
    groutVolume: 0,
    pressure: 0,
    heave: 0,
    isDrilling: false,
    isPumping: false,
    soilType: 'SAND',
    failState: 'NONE'
  });

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Language State
  const [language, setLanguage] = useState<Language>('th');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(true);

  const totalScenes = SCENES.length;
  const currentSceneData = SCENES[currentSceneIndex];
  const currentContent = currentSceneData[language];
  const ui = UI_TEXT[language];
  
  const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Audio System Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioScheduledSourceNode | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const subtitleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize Audio Context safely
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopSound = () => {
    if (activeSourceRef.current) {
        try {
            activeSourceRef.current.stop();
            activeSourceRef.current.disconnect();
        } catch (e) { /* ignore */ }
        activeSourceRef.current = null;
    }
    if (activeGainRef.current) {
        activeGainRef.current.disconnect();
        activeGainRef.current = null;
    }
  };

  const playDrillSound = () => {
    if (!isAudioEnabled) return;
    const ctx = initAudio();
    stopSound();
    
    // Improved Drill Sound: Softer Rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Use Triangle wave for a smoother, less harsh sound than Sawtooth
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime); // Low frequency rumble
    
    // Add a lowpass filter to muffle the sound further (like it's underground)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    activeSourceRef.current = osc;
    activeGainRef.current = gain;
  };

  const playPumpSound = () => {
    if (!isAudioEnabled) return;
    const ctx = initAudio();
    stopSound();
    
    // Create Noise Buffer for Hissing sound
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    
    // Lowpass to make it sound like liquid/hydraulic
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    
    activeSourceRef.current = noise;
    activeGainRef.current = gain;
  };

  const playSuccessSound = () => {
    if (!isAudioEnabled) return;
    const ctx = initAudio();
    stopSound();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up slightly
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  };
  
  const playFailSound = () => {
    if (!isAudioEnabled) return;
    const ctx = initAudio();
    stopSound();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  // --- Voiceover Logic ---
  const fullText = useMemo(() => currentContent.script.join(' '), [currentContent]);
  const scriptRanges = useMemo(() => {
    const ranges: number[] = [];
    let count = 0;
    currentContent.script.forEach(line => {
      ranges.push(count);
      count += line.length + 1; 
    });
    return ranges;
  }, [currentContent]);

  const stopSpeaking = useCallback(() => {
     if (window.speechSynthesis) window.speechSynthesis.cancel();
     if (voiceAudioRef.current) {
        try {
            voiceAudioRef.current.pause();
            voiceAudioRef.current.currentTime = 0;
        } catch(e) { /* ignore safe pause */ }
     }
     if (subtitleIntervalRef.current) {
         clearInterval(subtitleIntervalRef.current);
         subtitleIntervalRef.current = null;
     }
     setIsSpeaking(false);
  }, []);

  const playTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'th') utterance.lang = 'th-TH';
    else if (language === 'en') utterance.lang = 'en-US';
    else if (language === 'zh') utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utterance.onboundary = (event) => {
       if (event.name === 'word' || event.name === 'sentence') {
         const charIndex = event.charIndex;
         let foundIndex = 0;
         for (let i = 0; i < scriptRanges.length; i++) {
            if (charIndex >= scriptRanges[i]) {
                foundIndex = i;
            } else {
                break;
            }
         }
         setCurrentSubtitleIndex(foundIndex);
       }
    };
    window.speechSynthesis.speak(utterance);
  }, [language, scriptRanges]);

  const speak = useCallback((text: string, audioFile?: string, audioRange?: [number, number]) => {
    stopSpeaking();
    setCurrentSubtitleIndex(0);

    // Check for custom audio override
    const customAudio = customAudioMap[currentSceneData.id];
    const effectiveAudioFile = (language === 'th' && customAudio) ? customAudio : audioFile;
    const effectiveAudioRange = (language === 'th' && customAudio) ? undefined : audioRange;

    // 1. Try Audio File first if available
    if (effectiveAudioFile) {
        // Use the persistent audio ref if available, otherwise create new (fallback)
        let audio = voiceAudioRef.current;
        if (!audio) {
             audio = new Audio();
             voiceAudioRef.current = audio;
        }
        
        // Since we are using Vite imports (assets), effectiveAudioFile is already a resolved URL.
        // It works for both imported assets and Blob URLs from user uploads.
        const audioUrl = effectiveAudioFile;

        console.log("Playing audio:", audioUrl);

        // Reset and load new source
        audio.pause();
        audio.currentTime = 0;
        audio.src = audioUrl;
        audio.loop = false; 
        
        let hasError = false;

        const handleError = (e: any) => {
             if (hasError) return;
             hasError = true;
             console.warn("Audio error:", e);
             
             if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
             
             // Only fallback to TTS if NOT Thai
             if (language !== 'th') {
                playTTS(text);
             } else {
                setIsSpeaking(false);
                // Show a visual error or manual play button could be added here if needed
             }
        };

        // Set start time if range provided
        if (effectiveAudioRange) {
            audio.currentTime = effectiveAudioRange[0];
        }

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
        };
        audio.onerror = handleError;

        // Handle Range End
        audio.ontimeupdate = () => {
            if (effectiveAudioRange && audio.currentTime >= effectiveAudioRange[1]) {
                audio.pause();
                setIsSpeaking(false);
                if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
            }
        };

        // Better Subtitle Sync
        audio.onloadedmetadata = () => {
             let duration = audio.duration;
             if (effectiveAudioRange) duration = effectiveAudioRange[1] - effectiveAudioRange[0];

             if (isFinite(duration) && duration > 0) {
                 const script = currentContent.script;
                 const totalChars = script.reduce((acc, line) => acc + line.length, 0);
                 
                 if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
                 
                 const startTime = Date.now();
                 const durationMs = duration * 1000;
                 
                 subtitleIntervalRef.current = setInterval(() => {
                     const elapsed = Date.now() - startTime;
                     if (elapsed >= durationMs) {
                         if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
                         return;
                     }
                     let currentLine = 0;
                     let timeSoFar = 0;
                     for (let i = 0; i < script.length; i++) {
                         const lineDuration = (script[i].length / totalChars) * durationMs;
                         if (elapsed < timeSoFar + lineDuration) {
                             currentLine = i;
                             break;
                         }
                         timeSoFar += lineDuration;
                     }
                     setCurrentSubtitleIndex(currentLine);
                 }, 50);
             }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn("Autoplay blocked or failed:", e);
                // If blocked, we might want to show a "Play" button overlay
                if (e.name === 'NotAllowedError') {
                    setIsPlaying(false); // Stop the "playing" state so user can click Play manually
                }
                handleError(e);
            });
        }
        return;
    }

    // 2. Fallback to TTS
    if (language !== 'th') {
        playTTS(text);
    } else {
        // For Thai, if no audio file, do not play TTS
        setIsSpeaking(false);
    }
  }, [stopSpeaking, playTTS, scriptRanges, customAudioMap, currentSceneData.id, language]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioMap(prev => ({ ...prev, [currentSceneData.id]: url }));
      
      // Save to DB
      try {
        await saveAudio(currentSceneData.id, file);
      } catch (e) {
        console.error("Failed to save audio", e);
      }

      // Optionally reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleAudio = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      if (mode === 'STORY') speak(fullText, currentContent.audio, currentContent.audioRange);
    } else {
      setIsAudioEnabled(false);
      stopSpeaking();
      stopSound(); // Also stop SFX
    }
  };
  
  const togglePlay = () => {
    if (mode !== 'STORY') return; // Only auto-play in story mode
    const nextIsPlaying = !isPlaying;
    if (nextIsPlaying) {
      if (currentSceneIndex === totalScenes - 1) setCurrentSceneIndex(0);
      
      // Resume Logic
      if (isAudioEnabled) {
          if (voiceAudioRef.current && voiceAudioRef.current.paused && voiceAudioRef.current.src) {
              const playPromise = voiceAudioRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(e => {
                      if (e.name !== 'AbortError') console.warn("Resume failed", e);
                  });
              }
              setIsSpeaking(true);
          } else if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
              setIsSpeaking(true);
          } else if (!isSpeaking) {
              speak(fullText, currentContent.audio, currentContent.audioRange);
          }
      }
    } else {
      // Pause Logic
      if (isAudioEnabled) {
          if (voiceAudioRef.current) {
              try { voiceAudioRef.current.pause(); } catch(e) {}
          }
          if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
          setIsSpeaking(false); // Just visual state
      }
    }
    setIsPlaying(nextIsPlaying);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
    setIsAudioEnabled(true); // Enable audio capability but don't play yet
    setIsPlaying(false); // Ensure paused initially
    
    // Auto-start Tour
    setTimeout(() => {
      setMode('STORY');
      setTourStepIndex(0);
      setShowTour(true);
    }, 500);
  };

  // --- Auto-Play Logic ---
  useEffect(() => {
    // Load saved audios on mount
    const loadSavedAudios = async () => {
      const loadedMap: Record<number, string> = {};
      for (const scene of SCENES) {
        try {
          const blob = await getAudio(scene.id);
          if (blob) {
            loadedMap[scene.id] = URL.createObjectURL(blob);
          }
        } catch (e) {
          console.error("Failed to load audio for scene", scene.id, e);
        }
      }
      setCustomAudioMap(prev => ({ ...prev, ...loadedMap }));
    };
    loadSavedAudios();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // IMPORTANT: Add !showTour check to prevent auto-play during tour
    if (isPlaying && !showLanguageModal && mode === 'STORY' && !showTour) {
      // Logic for waiting for audio to finish before advancing
      const waitingForAudio = isAudioEnabled && isSpeaking;
      
      if (!waitingForAudio) {
        let delay = isAudioEnabled ? 2000 : 8000;
        if (currentSceneData.id === 2 && !isAudioEnabled) delay = 12000;
        if (currentSceneData.id === 5 && !isAudioEnabled) delay = 22000;

        timer = setTimeout(() => {
          // Check if we are still playing before advancing
          if (isPlaying) {
              if (currentSceneIndex >= totalScenes - 1) {
                 setIsPlaying(false);
              } else {
                 setCurrentSceneIndex(prev => {
                     // Ensure we don't go out of bounds
                     const next = prev + 1;
                     return next < totalScenes ? next : prev;
                 });
              }
          }
        }, delay);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, isSpeaking, isAudioEnabled, totalScenes, currentSceneData.id, showLanguageModal, mode, showTour]);

  // --- Scene Change Handler ---
  useEffect(() => {
    if (mode !== 'STORY' || showTour) { // Do not speak if tour is active
      stopSpeaking();
      return;
    }
    
    setCurrentSubtitleIndex(0);
    stopSpeaking();
    
    if (!showLanguageModal && isAudioEnabled && isPlaying) {
      const timer = setTimeout(() => {
        speak(fullText, currentContent.audio, currentContent.audioRange);
      }, 500);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    } else {
      stopSpeaking();
    }
  }, [currentSceneIndex, isAudioEnabled, fullText, speak, showLanguageModal, mode, showTour, isPlaying, stopSpeaking, currentContent.audio, currentContent.audioRange]);

  // --- Simulation Logic ---
  const startAction = (action: 'DRILL' | 'PUMP') => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    if (simState.failState !== 'NONE') return; // Cannot start if failed
    
    // Start SFX
    if (action === 'DRILL') playDrillSound();
    if (action === 'PUMP') playPumpSound();

    simulationInterval.current = setInterval(() => {
      // Haptic Feedback Loop (Vibrate every tick)
      if (navigator.vibrate) navigator.vibrate(30);

      setSimState(prev => {
        const newState = { ...prev };
        newState.isDrilling = action === 'DRILL';
        newState.isPumping = action === 'PUMP';
        
        if (action === 'DRILL') {
          // Drill down logic
          if (newState.drillDepth < 100) newState.drillDepth += 1;
        } else if (action === 'PUMP') {
          // Pump logic
          if (newState.drillDepth > 10) { // Must be drilled first
             if (newState.groutVolume < 100) newState.groutVolume += 0.5;
             
             // Pressure Logic: Clay requires more pressure
             const pressureMultiplier = newState.soilType === 'CLAY' ? 0.8 : 0.5;
             newState.pressure = newState.groutVolume * pressureMultiplier;

             // Heave Logic: Needs enough pressure to lift
             if (newState.pressure > 30) {
                if (newState.heave < 60) newState.heave += 0.2;
             }

             // FAIL STATE CHECK: Blowout (Shallow depth & High Pressure)
             if (newState.drillDepth < 25 && newState.pressure > 35) {
                newState.failState = 'BLOWOUT';
             }
          }
        }
        
        return newState;
      });
    }, 50);
  };

  const stopAction = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    stopSound(); // Stop SFX
    if (navigator.vibrate) navigator.vibrate(0); // Stop vibration
    
    setSimState(prev => ({...prev, isDrilling: false, isPumping: false}));
  };

  // Check for completion to play success sound or Fail sound
  useEffect(() => {
    if (mode === 'SIMULATION') {
       if (simState.failState !== 'NONE') {
         stopAction();
         playFailSound();
       }
    }
  }, [simState.failState, mode]);

  // Better way to track phase change for success sound
  const prevSimPhaseRef = useRef<string>('');
  const simPhase = simState.failState !== 'NONE' ? 'FAIL' : (simState.drillDepth < 100 ? 'DRILL' : (simState.groutVolume < 100 ? 'PUMP' : 'DONE'));

  useEffect(() => {
     if (mode === 'SIMULATION') {
        if (prevSimPhaseRef.current !== 'DONE' && simPhase === 'DONE') {
           playSuccessSound();
        }
        prevSimPhaseRef.current = simPhase;
     }
  }, [simPhase, mode]);


  const toggleSoil = () => {
     setSimState(prev => ({ ...prev, soilType: prev.soilType === 'SAND' ? 'CLAY' : 'SAND' }));
  };
  
  const resetSimulation = () => {
    setSimState({
      drillDepth: 0,
      groutVolume: 0,
      pressure: 0,
      heave: 0,
      isDrilling: false,
      isPumping: false,
      soilType: 'SAND',
      failState: 'NONE'
    });
  };

  // --- Quiz Logic ---
  const handleQuizAnswer = (optionIndex: number) => {
     if (optionIndex === QUIZ_DATA[currentQuestion].correctAnswer) {
        setScore(prev => prev + 1);
     }
     if (currentQuestion < QUIZ_DATA.length - 1) {
        setCurrentQuestion(prev => prev + 1);
     } else {
        setQuizFinished(true);
     }
  };

  const resetQuiz = () => {
     setCurrentQuestion(0);
     setScore(0);
     setQuizFinished(false);
  };


  // --- Navigation Wrappers ---
  const handleNext = () => {
    setIsPlaying(false);
    if (currentSceneIndex < totalScenes - 1) setCurrentSceneIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentSceneIndex > 0) setCurrentSceneIndex(prev => prev - 1);
  };

  // --- Tour Navigation Logic ---
  const handleTourNext = () => {
    if (tourStepIndex < GUIDE_STEPS.length - 1) {
      const nextStep = GUIDE_STEPS[tourStepIndex + 1];
      if (nextStep.modeRequired && nextStep.modeRequired !== mode) {
        setMode(nextStep.modeRequired);
      }
      setTourStepIndex(prev => prev + 1);
    } else {
      // Tour Finished
      setShowTour(false);
      setTourStepIndex(0);
      setMode('STORY'); 
      // Auto Start Story
      setIsPlaying(true);
      speak(fullText, currentContent.audio, currentContent.audioRange);
    }
  };

  const startTour = () => {
    setIsPlaying(false); // Pause story if manual restart tour
    setShowTour(true);
    setTourStepIndex(0);
    setMode('STORY');
  };

  // Current subtitle text
  const currentSubtitleText = currentContent.script[currentSubtitleIndex] || "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative font-Sarabun">
      
      {/* GUIDE OVERLAY */}
      {showTour && !showLanguageModal && (
         <TourGuide 
            stepIndex={tourStepIndex} 
            language={language}
            onNext={handleTourNext}
            onClose={() => setShowTour(false)}
         />
      )}

      {/* TEAM MEMBER MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-8 text-center animate-in zoom-in-95 duration-300 border-t-8 border-orange-500">
             <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-6 rounded-full">
               <Construction className="w-8 h-8 text-orange-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase tracking-wide">สมาชิกในกลุ่ม</h2>
             <div className="space-y-4 text-left">
                <div className="p-4 bg-slate-50 border-l-4 border-orange-500 shadow-sm">
                   <p className="font-bold text-lg text-slate-800">1. นายนพกร ปิยะบุตร</p>
                   <p className="text-slate-600 font-mono text-sm mt-1">66543303029-3 <span className="text-orange-600 font-bold ml-2">(พากย์เสียง)</span></p>
                </div>
                <div className="p-4 bg-slate-50 border-l-4 border-orange-500 shadow-sm">
                   <p className="font-bold text-lg text-slate-800">2. นายกิตติธัช ใหม่ดี</p>
                   <p className="text-slate-600 font-mono text-sm mt-1">66543303042-6 <span className="text-orange-600 font-bold ml-2">(พากย์เสียง)</span></p>
                </div>
                <div className="p-4 bg-slate-50 border-l-4 border-orange-500 shadow-sm">
                   <p className="font-bold text-lg text-slate-800">3. นายพงศ์ภวัน ศรีสวัสดิ์</p>
                   <p className="text-slate-600 font-mono text-sm mt-1">66543303061-6 <span className="text-orange-600 font-bold ml-2">(เว็บไซต์)</span></p>
                </div>
             </div>
             <button 
               onClick={() => { setShowTeamModal(false); setShowLanguageModal(true); }}
               className="mt-8 w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg rounded-sm flex items-center justify-center gap-2 group"
             >
               ไปต่อ <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      )}

      {/* LANGUAGE MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-2xl max-w-lg w-full p-8 text-center animate-in zoom-in-95 duration-300 border-t-8 border-orange-500">
            <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-6 rounded-sm">
              <Globe className="w-8 h-8 text-slate-800" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-wide">{ui.selectLanguage}</h2>
            <div className="grid gap-4 mt-6">
              {['th', 'en', 'zh'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => {
                      // UNLOCK AUDIO CONTEXT ON FIRST INTERACTION
                      if (voiceAudioRef.current) {
                          voiceAudioRef.current.src = ''; 
                          voiceAudioRef.current.load();
                          voiceAudioRef.current.play().catch(() => {}); // Silent play to unlock
                      }
                      handleLanguageSelect(lang as Language);
                  }}
                  className="group flex items-center justify-between p-4 border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all rounded-sm"
                >
                  <div className="flex items-center gap-4">
                     <span className="text-2xl">{lang === 'th' ? '🇹🇭' : lang === 'en' ? '🇬🇧' : '🇨🇳'}</span>
                     <span className="font-bold text-slate-800 uppercase">{lang === 'th' ? 'ภาษาไทย' : lang === 'en' ? 'English' : '中文'}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT AUDIO ELEMENT */}
      <audio ref={voiceAudioRef} className="hidden" preload="auto" />

      {/* LEFT: VISUAL STAGE */}
      <main className="flex-1 p-4 flex flex-col h-[60vh] md:h-screen transition-opacity duration-500" style={{ opacity: (showLanguageModal || showTeamModal) ? 0.3 : 1 }}>
        <header className="mb-4 flex justify-between items-center md:hidden">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Construction className="text-orange-600 w-5 h-5"/> Compaction Grouting
            </h1>
        </header>
        
        <div id="visual-stage" className="flex-1 relative shadow-lg overflow-hidden border border-slate-300 bg-white group rounded-sm">
          <VisualStage 
             currentScene={currentSceneData.id} 
             language={language} 
             mode={mode}
             simState={simState}
          />
          
          {/* Subtitles Overlay (Only in Story Mode) */}
          {mode === 'STORY' && showSubtitles && (
             <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <div className="bg-slate-900/85 backdrop-blur-md px-6 py-4 max-w-2xl text-center shadow-lg transition-all duration-300 transform border-l-4 border-orange-500 rounded-r-sm">
                  <p key={`${currentSceneIndex}-${currentSubtitleIndex}`} className="text-white text-base md:text-lg font-medium leading-relaxed font-Sarabun drop-shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {currentSubtitleText}
                  </p>
                </div>
             </div>
          )}

           {/* Story Status Indicators */}
           {mode === 'STORY' && !isPlaying && currentSceneIndex < totalScenes - 1 && !showLanguageModal && !showTour && (
             <div className="absolute top-4 right-4 bg-orange-600 text-white p-2 rounded-sm shadow-md">
               <Pause className="w-4 h-4" />
             </div>
           )}
        </div>
      </main>

      {/* RIGHT: CONTROLS & INFO (Sidebar) */}
      <aside className="w-full md:w-[420px] bg-slate-50 border-l border-slate-300 flex flex-col h-[40vh] md:h-screen overflow-y-auto transition-opacity duration-500" style={{ opacity: (showLanguageModal || showTeamModal) ? 0.3 : 1 }}>
        
        {/* Main Header - Construction Theme */}
        <div className="p-6 bg-slate-900 text-white hidden md:block relative overflow-hidden">
           {/* Caution Stripe Decoration */}
           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-black to-yellow-400 opacity-80" style={{backgroundSize: '20px 100%'}}></div>
           
           <div className="flex items-center justify-between gap-2 mb-1 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 flex items-center justify-center shadow-lg rounded-sm">
                  <Construction className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-orange-400 font-bold tracking-widest uppercase">{ui.engineeringVisualizer}</div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Compaction Grouting</h1>
                </div>
              </div>
              
              {/* HELP BUTTON for TOUR */}
              <button 
                onClick={startTour}
                className="p-2 rounded-sm hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors"
                title={ui.startTour}
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
        </div>

        {/* MODE TABS - Squared & Sharp */}
        <div className="flex border-b border-slate-300 bg-white">
          <button 
             id="tab-story"
             onClick={() => setMode('STORY')} 
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wide transition-colors ${mode === 'STORY' ? 'text-slate-900 border-b-4 border-orange-500 bg-slate-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
             <PlayCircle className="w-4 h-4" /> {ui.storyMode}
          </button>
          <button 
             id="tab-sim"
             onClick={() => setMode('SIMULATION')} 
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wide transition-colors ${mode === 'SIMULATION' ? 'text-slate-900 border-b-4 border-orange-500 bg-slate-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
             <Beaker className="w-4 h-4" /> {ui.labSim}
          </button>
          <button 
             id="tab-quiz"
             onClick={() => setMode('QUIZ')} 
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wide transition-colors ${mode === 'QUIZ' ? 'text-slate-900 border-b-4 border-orange-500 bg-slate-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
             <Activity className="w-4 h-4" /> {ui.quizMode}
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-slate-50">
          
          {/* --- STORY MODE CONTENT --- */}
          {mode === 'STORY' && (
            <>
              <div id="controls-area" className="flex justify-end gap-2 mb-4">
                 {/* Hidden File Input */}
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="audio/mp3,audio/wav,audio/mpeg" 
                   onChange={handleFileUpload} 
                 />
                 {/* Upload Button */}
                 {language === 'th' && (
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className={`p-2 rounded-sm border shadow-sm ${customAudioMap[currentSceneData.id] ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
                      title="Upload Custom Audio for this Scene"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                 )}
                 <button id="btn-language" onClick={() => setShowLanguageModal(true)} className="p-2 rounded-sm border border-slate-300 bg-white text-slate-600 hover:border-orange-500 hover:text-orange-600 shadow-sm"><Globe className="w-4 h-4" /></button>
                 <button onClick={togglePlay} className={`p-2 rounded-sm border shadow-sm ${isPlaying ? 'bg-orange-600 text-white border-orange-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                 <button onClick={toggleAudio} className={`p-2 rounded-sm border shadow-sm ${isAudioEnabled ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>{isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-widest text-xs mb-2 font-mono">
                  <span>{ui.scene} {currentSceneData.id} / {totalScenes}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {currentContent.title}
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed">{currentContent.description}</p>
                <div className={`border-l-4 p-4 rounded-r-sm bg-white shadow-sm ${isSpeaking ? 'border-orange-500' : 'border-slate-300'}`}>
                   <p className="text-slate-500 italic text-sm">{currentContent.script.join(' ')}</p>
                </div>
              </div>

              <div className="mt-auto flex gap-3">
                <button onClick={handlePrev} disabled={currentSceneIndex === 0} className="flex-1 py-3 border-2 border-slate-300 rounded-sm text-slate-600 font-bold uppercase tracking-wide hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">{ui.back}</button>
                <button onClick={handleNext} disabled={currentSceneIndex === totalScenes - 1} className="flex-[2] py-3 bg-slate-900 text-white rounded-sm font-bold uppercase tracking-wide hover:bg-slate-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                   {currentSceneIndex === totalScenes - 1 ? ui.finish : ui.nextScene}
                </button>
              </div>
            </>
          )}

          {/* --- SIMULATION MODE CONTENT --- */}
          {mode === 'SIMULATION' && (
            <div className="space-y-6">
              {/* Instruction Card - Safety Style */}
              <div className={`p-4 rounded-sm border-l-4 shadow-sm bg-white relative overflow-hidden ${
                simPhase === 'FAIL' ? 'border-red-500 bg-red-50' :
                simPhase === 'DRILL' ? 'border-yellow-500' :
                simPhase === 'PUMP' ? 'border-orange-500' :
                'border-green-500'
              }`}>
                 {/* Stripe pattern for instruction */}
                {simPhase !== 'DONE' && <div className="absolute top-0 right-0 w-16 h-16 opacity-5 pointer-events-none" style={{background: 'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)'}}></div>}

                <h3 className={`font-bold text-lg flex items-center gap-2 uppercase tracking-tight ${
                   simPhase === 'FAIL' ? 'text-red-700' :
                   simPhase === 'DRILL' ? 'text-yellow-700' :
                   simPhase === 'PUMP' ? 'text-orange-700' :
                   'text-green-700'
                }`}>
                  {simPhase === 'FAIL' && <><AlertOctagon className="w-5 h-5"/> {ui.phaseFail}</>}
                  {simPhase === 'DRILL' && <><AlertTriangle className="w-5 h-5"/> {ui.phaseDrill}</>}
                  {simPhase === 'PUMP' && <><Layers className="w-5 h-5"/> {ui.phaseGrout}</>}
                  {simPhase === 'DONE' && <><CheckCircle className="w-5 h-5"/> {ui.phaseDone}</>}
                </h3>
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  {simPhase === 'FAIL' ? (
                     simState.failState === 'BLOWOUT' ? ui.failBlowout : ui.failDamage
                  ) : (
                    simPhase === 'DRILL' ? ui.instrDrill :
                    simPhase === 'PUMP' ? ui.instrGrout :
                    ui.instrDone
                  )}
                </p>
              </div>

              {/* Technical Dashboard */}
              <div className="grid grid-cols-2 gap-4">
                  {/* Depth */}
                  <div className="bg-white p-4 rounded-sm border border-slate-300 shadow-sm relative">
                     <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{ui.depthLevel}</div>
                     <div className="text-3xl font-mono font-bold text-slate-800">{Math.round(simState.drillDepth)}<span className="text-sm text-slate-400 ml-1">%</span></div>
                     <div className="w-full bg-slate-100 h-2 mt-3 overflow-hidden rounded-sm">
                        <div className="bg-slate-800 h-full transition-all duration-300" style={{width: `${simState.drillDepth}%`}}></div>
                     </div>
                  </div>
                  
                  {/* Real-time Pressure Graph */}
                  <div className="bg-white p-4 rounded-sm border border-slate-300 shadow-sm relative col-span-1">
                     <div className="flex justify-between items-start mb-2">
                         <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{ui.pressure}</div>
                         <TrendingUp className="w-4 h-4 text-slate-300" />
                     </div>
                     <div className={`text-3xl font-mono font-bold ${simState.pressure > 30 ? 'text-red-600' : 'text-slate-800'}`}>{simState.pressure.toFixed(0)} <span className="text-sm font-sans text-slate-400 ml-1">bar</span></div>
                  </div>
              </div>
              
              {/* Large Heave Display - Digital Look */}
              <div className={`p-4 rounded-sm shadow-md flex justify-between items-center border-l-4 transition-colors ${
                 simState.failState === 'STRUCTURE_DAMAGE' ? 'bg-red-900 border-red-500' : 'bg-slate-900 border-purple-500'
              }`}>
                  <div>
                     <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{ui.heave}</div>
                     <div className="text-4xl font-mono font-bold text-white mt-1">+{simState.heave.toFixed(1)} <span className="text-lg font-sans text-slate-400">mm</span></div>
                  </div>
                  <Activity className={`${simState.failState === 'STRUCTURE_DAMAGE' ? 'text-red-500 animate-pulse' : 'text-purple-500'} w-10 h-10 opacity-80`} />
              </div>

              {/* Mechanical Action Buttons */}
              <div className="pt-2">
                {simPhase === 'DRILL' && (
                    <button 
                      onMouseDown={() => startAction('DRILL')}
                      onMouseUp={stopAction}
                      onMouseLeave={stopAction}
                      onTouchStart={() => startAction('DRILL')}
                      onTouchEnd={stopAction}
                      className="w-full py-6 bg-orange-600 text-white rounded-sm font-bold text-xl shadow-lg border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <ArrowDown className="w-8 h-8 group-hover:animate-bounce relative z-10" />
                      <span className="uppercase tracking-wider relative z-10">{ui.holdDrill}</span>
                    </button>
                )}
                {simPhase === 'PUMP' && (
                    <button 
                      onMouseDown={() => startAction('PUMP')}
                      onMouseUp={stopAction}
                      onMouseLeave={stopAction}
                      onTouchStart={() => startAction('PUMP')}
                      onTouchEnd={stopAction}
                      className="w-full py-6 bg-orange-600 text-white rounded-sm font-bold text-xl shadow-lg border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Layers className="w-8 h-8 group-hover:animate-pulse relative z-10" />
                      <span className="uppercase tracking-wider relative z-10">{ui.holdPump}</span>
                    </button>
                )}
                  {(simPhase === 'DONE' || simPhase === 'FAIL') && (
                    <button 
                      onClick={resetSimulation}
                      className="w-full py-6 bg-white text-slate-600 rounded-sm font-bold text-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <RotateCw className="w-6 h-6" />
                      {ui.resetSystem}
                    </button>
                )}
              </div>

              {/* Settings Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                 <button onClick={toggleSoil} disabled={simState.failState !== 'NONE'} className="col-span-2 p-3 rounded-sm border border-slate-300 hover:border-orange-500 bg-white text-xs font-bold uppercase tracking-wider text-slate-600 flex flex-row items-center justify-center gap-3 transition-colors disabled:opacity-50">
                    <span className={`w-3 h-3 rounded-full ${simState.soilType === 'SAND' ? 'bg-yellow-400' : 'bg-orange-700'}`}></span>
                    {ui.soilType}: <span className="text-slate-900">{simState.soilType}</span>
                 </button>
              </div>
            </div>
          )}

          {/* --- QUIZ MODE CONTENT --- */}
          {mode === 'QUIZ' && (
            <div className="h-full flex flex-col">
              {!quizFinished ? (
                 <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">{ui.question} {currentQuestion + 1} / {QUIZ_DATA.length}</div>
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-widest font-mono">{ui.score}: {score}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">
                      {QUIZ_DATA[currentQuestion].question[language]}
                    </h3>
                    <div className="space-y-3">
                       {QUIZ_DATA[currentQuestion].options[language].map((opt, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handleQuizAnswer(idx)}
                           className="w-full p-5 text-left rounded-sm border border-slate-200 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all font-semibold text-slate-700 shadow-sm"
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 bg-slate-900 rounded-sm flex items-center justify-center mb-8 shadow-xl">
                      <Activity className="w-12 h-12 text-green-400" />
                   </div>
                   <h2 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{ui.quizCompleted}</h2>
                   <p className="text-slate-500 mb-8 font-mono text-lg">{ui.finalScore}: <span className="font-bold text-slate-900">{score}</span> / {QUIZ_DATA.length}</p>
                   <button onClick={resetQuiz} className="px-8 py-4 bg-orange-600 text-white rounded-sm font-bold shadow-lg hover:bg-orange-700 uppercase tracking-wider border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all">
                     {ui.tryAgain}
                   </button>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>

    </div>
  );
};

export default App;