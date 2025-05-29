import { describe, expect, it } from 'vitest'
import { generateBooster, BoosterOptions } from './booster'
import type { HexCard } from '../../schema/src'

const deck: HexCard[] = Array.from({ length: 10 }).map((_, i) => ({
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
    const ids = new Set(pack.cards.map(c => c.id))
    expect(pack.cards).toHaveLength(6)
    expect(ids.size).toBe(pack.cards.length)
  })
})
