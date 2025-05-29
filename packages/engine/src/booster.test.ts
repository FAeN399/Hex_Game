import { describe, expect, it } from 'vitest'
import { generateBooster, BoosterOptions } from './booster'
import type { HexCardType } from 'schema'

const deck: HexCardType[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `c${i}`,
  name: `Card ${i}`,
  type: i % 2 === 0 ? 'unit' : 'spell',
  rarity: i < 2 ? 'rare' : i < 5 ? 'uncommon' : 'common',
  edges: ['attack','defense','skill','resource','link','element'],
  tags: [],
}))

describe('generateBooster', () => {
  it('creates pack with no duplicates', () => {
    const options: BoosterOptions = { playerId: 'p1', size: 6 }
    const pack = generateBooster(deck, options)
    const ids = new Set(pack.cards.map((c: HexCardType) => c.id))
    expect(pack.cards).toHaveLength(6)
    expect(ids.size).toBe(pack.cards.length)
  })
})
