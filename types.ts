export type Language = 'th' | 'en' | 'zh';

export interface SceneContent {
  title: string;
  description: string;
  script: string[];
  audio?: string; // Path to audio file (e.g., 'scene_1_th.mp3')
  audioRange?: [number, number]; // Start and End time in seconds
}

export interface SceneData {
  id: number;
  th: SceneContent;
  en: SceneContent;
  zh: SceneContent;
}

export enum AnimationState {
  IDLE = 'IDLE',
  DRIVING = 'DRIVING',
  GROUTING_BOTTOM = 'GROUTING_BOTTOM',
  WITHDRAWING = 'WITHDRAWING',
  COMPLETED = 'COMPLETED',
}

// --- New Types for Advanced Features ---

export type AppMode = 'STORY' | 'SIMULATION' | 'QUIZ';

export type SoilType = 'SAND' | 'CLAY';

export type FailState = 'NONE' | 'BLOWOUT' | 'STRUCTURE_DAMAGE';

export interface SimState {
  drillDepth: number; // 0 to 100%
  groutVolume: number; // Liters
  pressure: number; // Bar
  heave: number; // mm
  isDrilling: boolean;
  isPumping: boolean;
  soilType: SoilType;
  failState: FailState;
}

export interface QuizQuestion {
  id: number;
  question: {
    th: string;
    en: string;
    zh: string;
  };
  options: {
    th: string[];
    en: string[];
    zh: string[];
  };
  correctAnswer: number; // Index 0-3
}

export interface GuideStep {
  targetId: string;
  title: { th: string; en: string; zh: string };
  description: { th: string; en: string; zh: string };
  modeRequired?: AppMode;
}