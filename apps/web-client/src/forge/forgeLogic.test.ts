import { describe, it, expect } from 'vitest'
import { computeStatsAndClass, Equipped, Slot } from './forgeLogic'
import type { HexCard } from './forgeSchema'

const fireCard: HexCard = {
  id: '1',
  name: 'Flame',
  type: 'element',
  attributes: { strength: 1, element: 'fire' }
}

const iceCard: HexCard = {
  id: '2',
  name: 'Ice',
  type: 'element',
  attributes: { strength: 1, element: 'ice' }
}

const baseEquip: Equipped = {
  topLeft: fireCard,
  top: fireCard,
  topRight: fireCard,
  bottomLeft: iceCard,
  bottom: iceCard,
  bottomRight: iceCard
}

describe('computeStatsAndClass', () => {
  it('adds stats and detects elemental class', () => {
    const result = computeStatsAndClass(baseEquip)
    expect(result.stats.strength).toBe(6)
    expect(result.classLabel).toBe('Fire Mage')
  })
})
