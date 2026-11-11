import { create } from 'zustand'

export const useGameStore = create((set) => ({
  paused: false,
  quality: 'high',
  location: 'Ganache Bay',
  prompt: null,
  dialogue: null,
  event: null,
  mobileMove: { x: 0, y: 0 },
  mobileRun: false,
  jumpQueued: false,
  interactQueued: false,
  quest: {
    id: 'missing-crown',
    title: 'The Crown Situation',
    description: 'Find the alien king’s missing crown near Pizza Peak.',
    stage: 0,
  },
  discoveries: [],
  togglePause: () => set((state) => ({ paused: !state.paused })),
  setPaused: (paused) => set({ paused }),
  setQuality: (quality) => set({ quality }),
  setLocation: (location) => set({ location }),
  setPrompt: (prompt) => set({ prompt }),
  setDialogue: (dialogue) => set({ dialogue }),
  setEvent: (event) => set({ event }),
  setMobileMove: (mobileMove) => set({ mobileMove }),
  setMobileRun: (mobileRun) => set({ mobileRun }),
  queueJump: () => set({ jumpQueued: true }),
  consumeJump: () => set({ jumpQueued: false }),
  queueInteract: () => set({ interactQueued: true }),
  consumeInteract: () => set({ interactQueued: false }),
  advanceQuest: (stage, description) => set((state) => ({
    quest: { ...state.quest, stage, description },
  })),
  discover: (id) => set((state) => (
    state.discoveries.includes(id)
      ? state
      : { discoveries: [...state.discoveries, id] }
  )),
  resetGameUi: () => set({
    paused: false,
    location: 'Ganache Bay',
    prompt: null,
    dialogue: null,
    event: null,
    mobileMove: { x: 0, y: 0 },
    jumpQueued: false,
    interactQueued: false,
  }),
}))
