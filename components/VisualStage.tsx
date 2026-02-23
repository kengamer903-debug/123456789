import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, AppMode, SimState } from '../types';

interface VisualStageProps {
  currentScene: number;
  language: Language;
  mode: AppMode;
  simState?: SimState;
}

const LABELS = {
  th: {
    bearingStratum: "ชั้นดินแข็ง (Bearing Stratum)",
    looseSoil: "ดินหลวม (Loose Soil)",
    highPressure: "แรงดันสูง (High Pressure)",
    workingPrinciple: "หลักการทำงาน",
    conceptDesc: "Grout Expands like Balloon",
    voids: "โพรงใต้ดิน (Voids)",
    clay_soil: "ดินเหนียว (Clay)",
    sand_soil: "ดินทราย (Sand)",
    simMode: "Construction Sim",
    critical: "Critical Issue",
    solution: "Solution Active",
    scene: "ฉาก"
  },
  en: {
    bearingStratum: "Bearing Stratum",
    looseSoil: "Loose Soil",
    highPressure: "High Pressure",
    workingPrinciple: "Working Principle",
    conceptDesc: "Grout Expands like Balloon",
    voids: "Underground Voids",
    clay_soil: "Clay Soil",
    sand_soil: "Sandy Soil",
    simMode: "Construction Sim",
    critical: "Critical Issue",
    solution: "Solution Active",
    scene: "Scene"
  },
  zh: {
    bearingStratum: "坚硬持力层 (Bearing Stratum)",
    looseSoil: "松软土壤 (Loose Soil)",
    highPressure: "高压 (High Pressure)",
    workingPrinciple: "工作原理",
    conceptDesc: "浆液像气球一样膨胀",
    voids: "地下空洞 (Voids)",
    clay_soil: "粘土 (Clay)",
    sand_soil: "沙土 (Sand)",
    simMode: "施工模拟",
    critical: "关键问题",
    solution: "解决方案激活",
    scene: "场景"
  }
};

const VisualStage: React.FC<VisualStageProps> = ({ currentScene, language, mode, simState }) => {
  const labels = LABELS[language];
  const isSimulation = mode === 'SIMULATION' && simState;
  const isClay = isSimulation ? simState?.soilType === 'CLAY' : false;

  // --- Constants for drawing ---
  const GROUND_LEVEL = 150;
  const BOTTOM_LEVEL = 500;
  const PIPE_START_X = 400;
  const PIPE_WIDTH = 10;
  const PIPE_LENGTH = 800; 
  const BULB_RY = 30; // Radius Y of the bulb
  const BOTTOM_BULB_CY_STORY = BOTTOM_LEVEL - BULB_RY; 
  
  // --- Story Animation Durations ---
  const RIG_DRIVE_DURATION = 7;
  const DRILL_DOWN_DURATION = 6;
  const BULB_EXPANSION_DURATION = 5;
  const STACKING_TOTAL_DURATION = 18;
  const HEAVE_DURATION = 5;
  const RESET_DURATION = 1.5;
  const INITIAL_DELAY = 0.5;

  // --- Calculations for Simulation Mode ---
  
  let rigX = 0;
  let pipeY = GROUND_LEVEL - PIPE_LENGTH;
  let buildingY = 0;
  let buildingRotate = 0;
  let bulbScale = 0;
  let pipeFillHeight = 0;
  let simBulbY = BOTTOM_BULB_CY_STORY; // Default
  let isBlowout = false;
  let isDamaged = false;

  if (isSimulation && simState) {
    // Pipe Y based on drillDepth (0-100%)
    const targetDrilledY = (BOTTOM_LEVEL + 20) - PIPE_LENGTH;
    const retractedY = GROUND_LEVEL - PIPE_LENGTH;
    const range = targetDrilledY - retractedY;
    pipeY = retractedY + (range * (simState.drillDepth / 100));

    // Bulb Scale
    bulbScale = Math.min(simState.groutVolume / 80, 1.2);

    // Dynamic Bulb Position Logic:
    const effectiveScalePos = Math.max(bulbScale, 0.1);
    simBulbY = pipeY + PIPE_LENGTH + (BULB_RY * effectiveScalePos * 0.95); 

    // Building Heave based on simState.heave
    const maxSink = 35;
    const heaveFactor = Math.min(simState.heave, 100) / 50; // Allow it to go past 100 for dramatic fail
    buildingY = maxSink - (maxSink * heaveFactor);
    buildingRotate = 6 - (6 * heaveFactor);

    // Visualize grout inside pipe when pumping
    if (simState.groutVolume > 0) {
      pipeFillHeight = PIPE_LENGTH;
    }

    isBlowout = simState.failState === 'BLOWOUT';
    isDamaged = simState.failState === 'STRUCTURE_DAMAGE';

  } else {
    // --- Story Mode Logic ---
    rigX = currentScene >= 2 ? 0 : -600;
    const buildingSunkY = 35;
    const buildingSunkRotate = 6; 
    buildingY = (currentScene >= 1 && currentScene < 6) ? buildingSunkY : 0;
    buildingRotate = (currentScene >= 1 && currentScene < 6) ? buildingSunkRotate : 0;
    
    // Adjust rig starting position further off-screen to prevent edge peeking
    rigX = currentScene >= 2 ? 0 : -1200; 
  }

  // --- Pipe Animation (Story Mode) ---
  const storyPipeAnimation = useMemo(() => {
    if (isSimulation) return {}; // Handled manually

    const retractedY = GROUND_LEVEL - PIPE_LENGTH;
    const drilledY = (BOTTOM_LEVEL + 20) - PIPE_LENGTH;
    const withdrawnY = (GROUND_LEVEL - 100) - PIPE_LENGTH;

    if (currentScene <= 2) return { y: retractedY, transition: { duration: RESET_DURATION } };
    if (currentScene === 3) return { y: drilledY, transition: { duration: DRILL_DOWN_DURATION, ease: "linear" as const, delay: INITIAL_DELAY } };
    if (currentScene === 4) return { y: drilledY, transition: { duration: 0 } };
    if (currentScene === 5) {
      const startTip = BOTTOM_LEVEL + 20;
      const stepSize = 45;
      const steps = 6;
      const keyframes = [drilledY];
      for (let i = 1; i <= steps; i++) {
         const currentTip = startTip - (i * stepSize);
         keyframes.push(currentTip - PIPE_LENGTH);
      }
      return { y: keyframes, transition: { duration: STACKING_TOTAL_DURATION, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], ease: "linear" as const, delay: INITIAL_DELAY } };
    }
    if (currentScene === 6) return { y: withdrawnY, transition: { duration: RESET_DURATION } };
    return { y: retractedY };
  }, [currentScene, BOTTOM_LEVEL, GROUND_LEVEL, PIPE_LENGTH, isSimulation]);

  // --- Soil Particles ---
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 120;
      p.push({
        id: i,
        x: PIPE_START_X + Math.cos(angle) * dist,
        y: BOTTOM_LEVEL - 50 + Math.sin(angle) * (dist * 0.6),
        angle,
      });
    }
    return p;
  }, [BOTTOM_LEVEL, PIPE_START_X]);

  // --- Underground Voids ---
  const soilVoids = useMemo(() => [
    { id: 'v1', d: "M330,220 C310,210 300,240 320,260 C340,280 360,250 330,220 Z", bbox: {x: 300, y: 210, w: 70, h: 80}, type: 'shallow', delay: 8 },
    { id: 'v2', d: "M460,280 C480,270 500,290 490,320 C470,340 440,330 460,280 Z", bbox: {x: 440, y: 270, w: 70, h: 70}, type: 'shallow', delay: 5 },
    { id: 'v3', d: "M360,350 C340,340 330,370 350,390 C370,410 400,380 360,350 Z", bbox: {x: 330, y: 340, w: 80, h: 80}, type: 'deep', delay: 1 },
    { id: 'v4', d: "M430,380 C450,370 470,390 460,420 C440,440 410,430 430,380 Z", bbox: {x: 410, y: 370, w: 70, h: 80}, type: 'deep', delay: 2 },
    { id: 'v5', d: "M290,400 C270,390 260,420 280,440 C300,460 320,430 290,400 Z", bbox: {x: 260, y: 390, w: 70, h: 80}, type: 'deep', delay: 1.5 },
    { id: 'v6', d: "M510,230 C530,220 540,250 520,270 C500,290 480,260 510,230 Z", bbox: {x: 480, y: 220, w: 70, h: 80}, type: 'shallow', delay: 7 },
    { id: 'v7', d: "M380,280 C370,270 360,290 370,300 C390,310 400,290 380,280 Z", bbox: {x: 360, y: 270, w: 50, h: 50}, type: 'shallow', delay: 6 }
  ], []);

  // --- Organic Blob Path for Grout ---
  // A "blob" shape that replaces the perfect ellipse
  const organicBlobPath = useMemo(() => {
     // Center is roughly 400, simBulbY. Relative path:
     // M 0,-30 C 25,-35 45,-15 40,5 C 35,25 20,35 0,30 C -20,35 -35,25 -40,5 C -45,-15 -25,-35 0,-30
     return `M 0,-30 
             C 25,-35 45,-15 40,5 
             C 35,25 20,35 0,30 
             C -20,35 -35,25 -40,5 
             C -45,-15 -25,-35 0,-30 Z`;
  }, []);

  // --- Dust Particles ---
  const dustParticles = useMemo(() => Array.from({length: 12}), []);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden rounded-sm border border-slate-300 shadow-inner">
      <div className="w-full h-full relative">
      {/* Expanded viewBox to include roof (-100 top) and preserveAspectRatio "meet" to ensure full width/height visibility */}
      <svg className="w-full h-full" viewBox="0 -100 800 700" preserveAspectRatio="xMidYMid meet">
        
        {/* SKY - Adjusted to cover new top area */}
        <defs>
          <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <pattern id="soilPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="1.5" fill={isClay ? "#9ca3af" : "#a8a29e"} opacity="0.4" />
             <circle cx="12" cy="12" r="1.5" fill={isClay ? "#9ca3af" : "#a8a29e"} opacity="0.4" />
          </pattern>
          {/* Grout Texture */}
          <pattern id="groutTexture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
             <rect width="10" height="10" fill="#64748b"/>
             <circle cx="3" cy="3" r="1" fill="#475569" opacity="0.5" />
             <circle cx="8" cy="8" r="1" fill="#94a3b8" opacity="0.3" />
          </pattern>
        </defs>
        <rect x="0" y="-100" width="800" height={GROUND_LEVEL + 100} fill="url(#skyGradient)" />

        {/* BUILDING */}
        <motion.g
           key={isSimulation ? 'building-sim' : (currentScene === 1 ? 'building-intro' : 'building-static')}
           initial={isSimulation ? { y: buildingY, rotate: buildingRotate } : (currentScene === 1 ? { y: 0, rotate: 0 } : { y: buildingY, rotate: buildingRotate })}
           animate={{ y: buildingY, rotate: buildingRotate }}
           transition={{ 
             duration: isSimulation ? 0.2 : (currentScene === 1 ? 5 : (currentScene === 6 ? HEAVE_DURATION : 0.5)), 
             ease: isSimulation ? "linear" : "easeInOut", 
             delay: (currentScene === 1 && !isSimulation) ? 3 : (currentScene === 6 && !isSimulation ? 1 : 0) 
           }}
           style={{ originX: "350px", originY: "150px" }} 
        >
          {/* House Body */}
          <path d="M300,150 L300,50 L500,50 L500,150 Z" fill="#fff" stroke="#334155" strokeWidth="3" />
          {/* Roof */}
          <path d="M280,50 L400,-30 L520,50 Z" fill="#f87171" stroke="#b91c1c" strokeWidth="3" />
          {/* Windows */}
          <rect x="330" y="70" width="40" height="40" fill="#bae6fd" stroke="#334155" strokeWidth="2" />
          <rect x="430" y="70" width="40" height="40" fill="#bae6fd" stroke="#334155" strokeWidth="2" />
          {/* Door */}
          <rect x="380" y="100" width="40" height="50" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          
          {/* Existing Cracks (Sinking) */}
          <motion.path 
            d="M310,140 L330,120 L325,100" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="3"
            initial={{ opacity: (currentScene === 1 || (currentScene > 1 && currentScene < 6) || isSimulation && buildingY > 10) ? 1 : 0 }}
            animate={{ opacity: (isSimulation ? (buildingY > 10 ? 1 : 0) : ((currentScene === 1 || (currentScene > 1 && currentScene < 6)) ? 1 : 0)) }}
            transition={{ duration: 0.5 }} 
          />
           <motion.path 
            d="M480,140 L460,110" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="3"
            initial={{ opacity: (currentScene === 1 || (currentScene > 1 && currentScene < 6) || isSimulation && buildingY > 10) ? 1 : 0 }}
            animate={{ opacity: (isSimulation ? (buildingY > 10 ? 1 : 0) : ((currentScene === 1 || (currentScene > 1 && currentScene < 6)) ? 1 : 0)) }}
            transition={{ duration: 0.5 }}
          />

          {/* Severe Damage Cracks (FAIL STATE) */}
           <motion.path 
            d="M400,10 L400,90" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isDamaged ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
           <motion.path 
            d="M300,50 L350,100" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isDamaged ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </motion.g>

        {/* GROUND LAYER */}
        <rect x="0" y={GROUND_LEVEL} width="800" height="450" fill={isClay ? "#e7e5e4" : "#f5f5f4"} />
        <rect x="0" y={GROUND_LEVEL} width="800" height="450" fill="url(#soilPattern)" />
        
        {/* VOIDS */}
        {soilVoids.map((voidItem) => {
          let isFilled = false;
          let delayTime = voidItem.delay;
          let simFillHeight = 0;

          if (isSimulation) {
            // Simulation Logic for Void Filling
             if (simState && simState.groutVolume > 0) {
               // Map volume to fill height based on depth
               if (voidItem.type === 'deep') {
                  simFillHeight = Math.min(Math.max((simState.groutVolume - 10) * 2, 0), 100);
               } else {
                  simFillHeight = Math.min(Math.max((simState.groutVolume - 50) * 2, 0), 100);
               }
               // Treat as filled if partially filled for the clip path
               if (simFillHeight > 0) isFilled = true;
             }
          } else {
             // Story Mode Logic
             if (voidItem.type === 'deep' && currentScene >= 4) {
               isFilled = true;
             } else if (voidItem.type === 'shallow' && currentScene >= 5) {
               isFilled = true;
             } else if (currentScene > 5) {
               isFilled = true;
               delayTime = 0; 
             }
          }
          
          const clipId = `clip-${voidItem.id}`;
          const { x, y, w, h } = voidItem.bbox;

          return (
            <g key={voidItem.id}>
              <defs>
                <clipPath id={clipId}>
                  <motion.rect
                    x={x}
                    width={w}
                    initial={{ y: y + h, height: 0 }}
                    animate={
                      isSimulation
                      ? { y: y + h - (h * simFillHeight / 100), height: h * simFillHeight / 100 }
                      : (isFilled 
                        ? { y: y, height: h } 
                        : { y: y + h, height: 0 })
                    }
                    transition={{ 
                      duration: isSimulation ? 0.3 : 6,
                      ease: "easeInOut",
                      delay: (isSimulation) ? 0 : (isFilled && currentScene !== 6) ? delayTime : 0
                    }}
                  />
                </clipPath>
              </defs>
              <path d={voidItem.d} fill="#d6d3d1" stroke="#a8a29e" strokeWidth="1" />
              <path d={voidItem.d} fill="#64748b" clipPath={`url(#${clipId})`} stroke="none" />
            </g>
          );
        })}

        {/* Soil Layers Lines */}
        <line x1="0" y1={GROUND_LEVEL + 120} x2="800" y2={GROUND_LEVEL + 120} stroke="#e7e5e4" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="0" y1={GROUND_LEVEL + 280} x2="800" y2={GROUND_LEVEL + 280} stroke="#e7e5e4" strokeWidth="2" strokeDasharray="8 8" />

        {/* BEARING STRATUM */}
        <rect x="0" y={BOTTOM_LEVEL} width="800" height="100" fill="#475569" />
        <text x="20" y={BOTTOM_LEVEL + 40} fill="#94a3b8" fontSize="16" fontWeight="bold" fontFamily="Sarabun">{labels.bearingStratum}</text>

        {/* PARTICLES */}
        {!isSimulation && particles.map((p) => {
          const isCompacting = currentScene >= 4; // Compaction starts at scene 4
          const push = isCompacting ? 25 : 0;
          return (
            <motion.circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="#78716c"
              initial={{ x: 0, y: 0 }}
              animate={{
                x: isCompacting ? Math.cos(p.angle) * push : 0,
                y: isCompacting ? Math.sin(p.angle) * push : 0,
              }}
              transition={{ 
                duration: BULB_EXPANSION_DURATION, 
                ease: "circOut", 
                delay: currentScene === 4 ? INITIAL_DELAY : 0 
              }}
            />
          );
        })}

        {/* GROUT COLUMN */}
        <g>
          {isSimulation ? (
            // SIMULATION GROUT
            <motion.g 
               initial={{ x: PIPE_START_X, y: simBulbY, scale: 0 }} 
               animate={{ x: PIPE_START_X, y: simBulbY, scale: bulbScale }}
               transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
               <path 
                 d={organicBlobPath} 
                 fill="url(#groutTexture)" 
                 stroke="#334155" 
                 strokeWidth="2"
               />
            </motion.g>
          ) : (
             // STORY GROUT
             <>
              <motion.g
                initial={{ x: PIPE_START_X, y: BOTTOM_BULB_CY_STORY, scale: 0 }}
                animate={{ 
                    x: PIPE_START_X, 
                    y: BOTTOM_BULB_CY_STORY,
                    scale: currentScene >= 4 ? 1 : 0 
                }}
                transition={{ duration: BULB_EXPANSION_DURATION, delay: currentScene === 4 ? INITIAL_DELAY : 0, ease: "circOut" }}
              >
                  <path d={organicBlobPath} fill="url(#groutTexture)" stroke="#334155" strokeWidth="2" />
              </motion.g>
              
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <motion.g 
                    key={i}
                    initial={{ x: PIPE_START_X, y: BOTTOM_BULB_CY_STORY - (i * 45), scale: 0 }}
                    animate={{ 
                        x: PIPE_START_X, 
                        y: BOTTOM_BULB_CY_STORY - (i * 45),
                        scale: currentScene >= 5 ? 1 : 0 
                    }}
                    transition={{ duration: 3, delay: currentScene >= 5 ? (INITIAL_DELAY + (i * 2.5)) : 0, ease: "circOut" }}
                 >
                   <path d={organicBlobPath} fill="url(#groutTexture)" stroke="#334155" strokeWidth="2" transform="scale(0.85)" />
                 </motion.g>
              ))}
             </>
          )}
        </g>

        {/* DRILL RIG & PIPE */}
        <motion.g
          animate={{ x: rigX }}
          initial={{ x: -1200 }} 
          transition={{ duration: RIG_DRIVE_DURATION, ease: "easeInOut" }}
        >
          {/* PIPE */}
          <motion.rect
             x={PIPE_START_X - (PIPE_WIDTH/2)} 
             width={PIPE_WIDTH}
             height={PIPE_LENGTH} 
             fill="#1e293b" 
             initial={{ y: GROUND_LEVEL - PIPE_LENGTH }}
             animate={isSimulation ? { y: pipeY } : storyPipeAnimation}
             transition={isSimulation ? { duration: 0.1 } : undefined}
          />

          {/* SIMULATION: CONCRETE FLOW INSIDE PIPE */}
          {isSimulation && pipeFillHeight > 0 && (
             <motion.rect 
                x={PIPE_START_X - (PIPE_WIDTH/2) + 2}
                width={PIPE_WIDTH - 4}
                height={PIPE_LENGTH}
                initial={{ y: GROUND_LEVEL - PIPE_LENGTH }}
                animate={{ y: pipeY }}
                fill="#94a3b8"
                opacity={0.8}
             />
          )}

           {/* BLOWOUT EFFECT (FAIL STATE) */}
           {isBlowout && (
             <g transform={`translate(${PIPE_START_X}, ${GROUND_LEVEL})`}>
                <motion.path 
                  d="M -20,0 Q -30,-50 -60,-60 L -40,-80 Q 0,-100 40,-80 L 60,-60 Q 30,-50 20,0 Z"
                  fill="#64748b"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.2], opacity: 1 }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
                />
                {/* Erupting particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.circle 
                       key={i}
                       cx={0} cy={0} r={5} fill="#475569"
                       initial={{ opacity: 1, y: 0, x: 0 }}
                       animate={{ opacity: 0, y: -100 - Math.random()*50, x: (Math.random()-0.5)*100 }}
                       transition={{ duration: 0.5 + Math.random()*0.5, repeat: Infinity, ease: "easeOut" }}
                    />
                ))}
             </g>
           )}

           {/* DRILLING DUST PARTICLES */}
           {isSimulation && simState.isDrilling && (
              <g transform={`translate(${PIPE_START_X}, ${GROUND_LEVEL})`}>
                 {dustParticles.map((_, i) => (
                    <motion.circle 
                       key={i}
                       r={Math.random() * 3 + 1}
                       fill="#a8a29e"
                       initial={{ x: 0, y: 0, opacity: 0 }}
                       animate={{ 
                         x: (Math.random() - 0.5) * 60, 
                         y: -Math.random() * 40, 
                         opacity: [0, 0.8, 0],
                         scale: [0.5, 1.5]
                       }}
                       transition={{ 
                         duration: 0.8, 
                         repeat: Infinity, 
                         delay: Math.random() * 0.5,
                         ease: "easeOut" 
                       }}
                    />
                 ))}
              </g>
           )}
           {/* Story Mode Dust - Show during scene 3 (drilling) */}
           {!isSimulation && currentScene === 3 && (
              <g transform={`translate(${PIPE_START_X}, ${GROUND_LEVEL})`}>
                 {dustParticles.map((_, i) => (
                    <motion.circle 
                       key={i}
                       r={Math.random() * 3 + 1}
                       fill="#a8a29e"
                       initial={{ x: 0, y: 0, opacity: 0 }}
                       animate={{ 
                         x: (Math.random() - 0.5) * 60, 
                         y: -Math.random() * 40, 
                         opacity: [0, 0.8, 0],
                         scale: [0.5, 1.5]
                       }}
                       transition={{ 
                         duration: 0.8, 
                         repeat: Infinity, 
                         delay: Math.random() * 0.5 + 1, // Start after 1s
                         ease: "easeOut" 
                       }}
                    />
                 ))}
              </g>
           )}
          
          {/* RIG BODY - Updated Colors for Theme */}
          <g transform={`translate(${PIPE_START_X}, ${GROUND_LEVEL})`}>
            {/* Base Body */}
            <rect x="-60" y="-20" width="120" height="25" rx="2" fill="#0f172a" />

            {/* Wheels with Rotation */}
            {[-45, -15, 15, 45].map((cx, i) => (
               <motion.g 
                 key={i} 
                 transform={`translate(${cx}, -8)`}
               >
                 <motion.g
                   animate={{ rotate: currentScene >= 2 ? 360 * 6 : 0 }}
                   transition={{ duration: RIG_DRIVE_DURATION, ease: "easeInOut" }}
                 >
                   <circle r="8" fill="#334155" />
                   {/* Spokes to visualize rotation */}
                   <path d="M0,-6 L0,6 M-6,0 L6,0" stroke="#64748b" strokeWidth="2" />
                 </motion.g>
               </motion.g>
            ))}

            <path d="M-50,-20 L-50,-70 L30,-70 L50,-20 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
            <rect x="-40" y="-60" width="30" height="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="30" y="-60" width="50" height="40" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
            <rect x="-15" y="-160" width="30" height="140" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <rect x="-20" y="-100" width="40" height="20" fill="#1e293b" />

            {/* Hydraulic Hoses - Animated */}
            {/* Connecting Body to Drill Head */}
            <motion.path 
              d={`M 50,-50 Q ${80 + (isSimulation && simState.isDrilling ? Math.random()*5 : 0)} -100 -5,-160`}
              fill="none" stroke="#1e293b" strokeWidth="3"
            />
             <motion.path 
              d={`M 55,-50 Q ${90 + (isSimulation && simState.isPumping ? Math.random()*5 : 0)} -110 -5,-150`}
              fill="none" stroke="#1e293b" strokeWidth="3"
            />
          </g>
        </motion.g>

        {/* CONCEPT POPUP (Story Mode Only) */}
        <AnimatePresence>
          {currentScene === 4 && !isSimulation && (
             <motion.g
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               transition={{ delay: 1, duration: 1 }} 
             >
                <path d="M540,270 L460,330 L530,280" fill="white" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="500" y="100" width="220" height="180" rx="4" fill="white" stroke="#cbd5e1" strokeWidth="3" />
                <text x="610" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155" fontFamily="Sarabun">{labels.workingPrinciple}</text>
                <rect x="530" y="150" width="160" height="100" fill="#f1f5f9" stroke="#cbd5e1" />
                <rect x="605" y="140" width="10" height="60" fill="#334155" />
                <motion.circle 
                   cx="610" cy="210" 
                   r="10" 
                   fill="#64748b"
                   animate={{ r: [10, 35, 35, 10] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                    <path d="M570,210 L550,210" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <path d="M650,210 L670,210" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                </motion.g>
                <text x="610" y="270" textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="Sarabun">{labels.conceptDesc}</text>
             </motion.g>
          )}
        </AnimatePresence>

        {/* TEXT LABELS */}
        {currentScene === 1 && !isSimulation && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <text x="550" y="300" fontSize="16" fill="#ef4444" fontWeight="bold" fontFamily="Sarabun">{labels.looseSoil}</text>
                <path d="M540,300 L450,320" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" strokeDasharray="5 5"/>
                <path d="M540,300 L340,250" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
                <text x="310" y="235" fontSize="14" fill="#78716c" fontWeight="bold" fontFamily="Sarabun">{labels.voids}</text>
            </motion.g>
        )}
        
        {((currentScene === 4 && !isSimulation) || (isSimulation && simState && simState.pressure > 20)) && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <text x="500" y="480" fontSize="16" fill="#be123c" fontWeight="bold" fontFamily="Sarabun">{labels.highPressure}</text>
                <path d="M490,480 L450,480" stroke="#be123c" strokeWidth="2" markerEnd="url(#arrowRed)" />
            </motion.g>
        )}

        <defs>
          <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </marker>
        </defs>
      </svg>
      </div>
      
      {/* HUD Info - Squared & Dark */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
         <div className="flex gap-2">
          {mode === 'STORY' && (
            <span className="bg-slate-900/90 backdrop-blur px-3 py-1 rounded-sm shadow text-xs font-semibold text-white uppercase tracking-wider">
              {labels.scene}: {currentScene}
            </span>
          )}
          {mode === 'SIMULATION' && (
             <span className="bg-slate-900/90 backdrop-blur px-3 py-1 rounded-sm shadow text-xs font-semibold text-orange-400 uppercase tracking-wider">{labels.simMode}</span>
          )}
          {currentScene === 1 && mode === 'STORY' && <span className="bg-red-600 px-3 py-1 rounded-sm shadow text-xs font-semibold text-white uppercase tracking-wider">{labels.critical}</span>}
          {currentScene >= 2 && mode === 'STORY' && <span className="bg-orange-600 px-3 py-1 rounded-sm shadow text-xs font-semibold text-white uppercase tracking-wider">{labels.solution}</span>}
         </div>
         
         {/* Simulation Specific HUD */}
         {isSimulation && simState && (
           <div className="flex gap-2">
             <span className={`px-3 py-1 rounded-sm shadow text-xs font-semibold uppercase tracking-wider ${simState.soilType === 'CLAY' ? 'bg-orange-600 text-white' : 'bg-yellow-500 text-slate-900'}`}>
               {simState.soilType === 'CLAY' ? labels.clay_soil : labels.sand_soil}
             </span>
           </div>
         )}
      </div>
    </div>
  );
};

export default VisualStage;