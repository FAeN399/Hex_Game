import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HexCardType } from 'schema'
import type { BoosterPackType } from 'schema'

interface DeckState {
  cards: HexCardType[]
  boosterHistory: BoosterPackType[]
  addCard: (card: HexCardType) => void
  addBooster: (pack: BoosterPackType) => void
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
