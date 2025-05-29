import { describe, it, expect } from 'vitest'
import { fuse } from './fuse'
import type { HexCardType } from 'schema'

const cards: HexCardType[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `c${i}`,
  name: `C${i}`,
  power: i + 1,
  type: 'unit',
  rarity: 'common',
  edges: ['attack','defense','skill','resource','link','element'],
  tags: []
})) as any

describe('fuse', () => {
  it('creates a character by default', () => {
    const result = fuse(cards, 'Hero') as any
    expect(result.cardIds).toHaveLength(6)
  })

  it('creates a ship when kind="ship"', () => {
    const result = fuse(cards, 'Ship', 'ship') as any
    expect(result.partIds).toHaveLength(6)
  })
})
