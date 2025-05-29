import { create } from 'zustand'
import type { HexCard } from './forgeSchema'
import type { Slot, Equipped } from './forgeLogic'
import { computeStatsAndClass } from './forgeLogic'

interface ForgeState {
  name: string
  equippedCards: Equipped
  finalStats: { strength: number; agility: number; intellect: number }
  classLabel: string
  setName: (name: string) => void
  setCard: (slot: Slot, card: HexCard | null) => void
  reset: () => void
}

const emptyEquip: Equipped = {
  topLeft: null,
  top: null,
  topRight: null,
  bottomLeft: null,
  bottom: null,
  bottomRight: null
}

export const useCharacterForgeStore = create<ForgeState>((set) => ({
  name: '',
  equippedCards: emptyEquip,
  finalStats: { strength: 0, agility: 0, intellect: 0 },
  classLabel: 'Adventurer',
  setName: (name) => set({ name }),
  setCard: (slot, card) =>
    set((state) => {
      const updated: Equipped = { ...state.equippedCards, [slot]: card }
      const { stats, classLabel } = computeStatsAndClass(updated)
      return { equippedCards: updated, finalStats: stats, classLabel }
    }),
  reset: () =>
    set({
      name: '',
      equippedCards: emptyEquip,
      finalStats: { strength: 0, agility: 0, intellect: 0 },
      classLabel: 'Adventurer'
    })
}))
