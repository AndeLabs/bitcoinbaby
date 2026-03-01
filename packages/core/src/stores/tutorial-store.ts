/**
 * Tutorial Store
 *
 * Manages tutorial state for first-time users.
 * - Tracks if user has seen the tutorial
 * - Tracks current step in the tutorial
 * - Persists state to localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tutorial step definitions
 */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  icon?: string;
}

/**
 * Default tutorial steps
 */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bienvenido a BitcoinBaby!",
    description:
      "Cria tu bebe digital mientras minas Bitcoin. Tu bebe crece y evoluciona con cada hash que minas.",
    position: "center",
    icon: "👶",
  },
  {
    id: "create-wallet",
    title: "Crea tu Wallet",
    description:
      "Primero necesitas una wallet Bitcoin para recibir tus $BABY tokens. Haz clic en CONNECT para crear una.",
    targetSelector: '[data-tutorial="wallet-button"]',
    position: "bottom",
    icon: "💼",
  },
  {
    id: "start-mining",
    title: "Comienza a Minar",
    description:
      "Presiona START MINING para comenzar a minar Bitcoin. Tu bebe ganara experiencia con cada hash.",
    targetSelector: '[data-tutorial="mining-button"]',
    position: "top",
    icon: "⛏️",
  },
  {
    id: "baby-stats",
    title: "Cuida a tu Baby",
    description:
      "Mantén la energia, felicidad y salud de tu bebe. Si el hambre sube demasiado, tu bebe puede enfermar!",
    targetSelector: '[data-tutorial="baby-stats"]',
    position: "left",
    icon: "❤️",
  },
  {
    id: "evolution",
    title: "Evolucion y Niveles",
    description:
      "Tu bebe evoluciona cada 5 niveles: Egg -> Baby -> Child -> Teen -> Adult. Cada etapa da bonus de minado!",
    targetSelector: '[data-tutorial="level-display"]',
    position: "bottom",
    icon: "🚀",
  },
  {
    id: "earn-tokens",
    title: "Gana $BABY Tokens",
    description:
      "Por cada prueba de trabajo valida, ganas $BABY tokens en Bitcoin usando el protocolo Charms.",
    targetSelector: '[data-tutorial="token-balance"]',
    position: "left",
    icon: "🪙",
  },
  {
    id: "complete",
    title: "Listo para Empezar!",
    description:
      "Ahora sabes todo lo basico. Mina, cuida a tu bebe, y gana $BABY tokens. Buena suerte!",
    position: "center",
    icon: "🎉",
  },
];

interface TutorialStore {
  // State
  hasSeenTutorial: boolean;
  currentStep: number;
  isActive: boolean;
  steps: TutorialStep[];

  // Actions
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  goToStep: (step: number) => void;
}

// =============================================================================
// SELECTORS (Reactive computed values)
// =============================================================================

/** Get current step data - use with useTutorialStore(selectCurrentStepData) */
export const selectCurrentStepData = (
  state: TutorialStore,
): TutorialStep | null => state.steps[state.currentStep] ?? null;

/** Get total steps count */
export const selectTotalSteps = (state: TutorialStore): number =>
  state.steps.length;

/** Check if on last step */
export const selectIsLastStep = (state: TutorialStore): boolean =>
  state.currentStep >= state.steps.length - 1;

/** Check if on first step */
export const selectIsFirstStep = (state: TutorialStore): boolean =>
  state.currentStep === 0;

/** Get tutorial progress percentage */
export const selectProgress = (state: TutorialStore): number =>
  ((state.currentStep + 1) / state.steps.length) * 100;

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      // Initial state
      hasSeenTutorial: false,
      currentStep: 0,
      isActive: false,
      steps: TUTORIAL_STEPS,

      // Actions
      startTutorial: () => {
        set({
          isActive: true,
          currentStep: 0,
        });
      },

      nextStep: () => {
        const state = get();
        if (state.currentStep < state.steps.length - 1) {
          set({ currentStep: state.currentStep + 1 });
        } else {
          // Last step - complete tutorial
          state.completeTutorial();
        }
      },

      previousStep: () => {
        const state = get();
        if (state.currentStep > 0) {
          set({ currentStep: state.currentStep - 1 });
        }
      },

      skipTutorial: () => {
        set({
          isActive: false,
          hasSeenTutorial: true,
          currentStep: 0,
        });
      },

      completeTutorial: () => {
        set({
          isActive: false,
          hasSeenTutorial: true,
          currentStep: 0,
        });
      },

      resetTutorial: () => {
        set({
          hasSeenTutorial: false,
          currentStep: 0,
          isActive: false,
        });
      },

      goToStep: (step: number) => {
        const state = get();
        if (step >= 0 && step < state.steps.length) {
          set({ currentStep: step });
        }
      },
    }),
    {
      name: "bitcoinbaby-tutorial",
      partialize: (state) => ({
        hasSeenTutorial: state.hasSeenTutorial,
      }),
    },
  ),
);

/**
 * Hook to check if tutorial should auto-start
 */
export function useShouldShowTutorial(): boolean {
  const { hasSeenTutorial, isActive } = useTutorialStore();
  return !hasSeenTutorial && !isActive;
}

export default useTutorialStore;
