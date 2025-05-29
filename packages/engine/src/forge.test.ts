import { describe, it, expect } from 'vitest'
import { forgeCharacter, HexCard } from './index'

const cards: HexCard[] = [
  { id: 'c1', name: 'A', power: 1 },
  { id: 'c2', name: 'B', power: 2 },
  { id: 'c3', name: 'C', power: 3 },
  { id: 'c4', name: 'D', power: 4 },
  { id: 'c5', name: 'E', power: 5 },
  { id: 'c6', name: 'F', power: 6 }
]

describe('forgeCharacter', () => {
  it('combines power from all six cards', () => {
    const character = forgeCharacter(cards, 'Hero')
    expect(character.totalPower).toBe(21)
    expect(character.cardIds).toHaveLength(6)
  })

  it('throws if not six cards', () => {
    expect(() => forgeCharacter(cards.slice(0, 5), 'Hero')).toThrow()
  })
})
