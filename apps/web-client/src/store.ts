import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HexCard } from '../../packages/schema/src'
import type { BoosterPack } from '../../packages/schema/src'

interface DeckState {
  cards: HexCard[]
  boosterHistory: BoosterPack[]
  addCard: (card: HexCard) => void
  addBooster: (pack: BoosterPack) => void
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      cards: [],
      boosterHistory: [],
      addCard: card => set(state => ({ cards: [...state.cards, card] })),
      addBooster: pack => set(state => ({ boosterHistory: [...state.boosterHistory, pack] }))
    }),
    { name: 'deck-store' }
  )
)
