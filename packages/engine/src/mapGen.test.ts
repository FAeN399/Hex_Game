import { describe, it, expect } from 'vitest'
import { generateMap } from './mapGen'
import { Terrain } from '../../schema/src'

const weights = { plains: 0.6, forest: 0.4 } as const

function countBy<T extends string>(tiles: { terrain: T }[]): Record<T, number> {
  const counts: Record<string, number> = {}
  for (const t of tiles) counts[t.terrain] = (counts[t.terrain] || 0) + 1
  return counts as Record<T, number>
}

describe('generateMap', () => {
  it('creates the correct number of tiles', () => {
    const tiles = generateMap({ width: 5, height: 4, terrainWeights: weights, seed: 1, theme: 'fantasy' })
    expect(tiles).toHaveLength(20)
  })

  it('approximates terrain distribution', () => {
    const tiles = generateMap({ width: 50, height: 50, terrainWeights: weights, seed: 42, theme: 'fantasy' })
    const counts = countBy(tiles)
    const total = tiles.length
    for (const key of Object.keys(weights) as Array<keyof typeof weights>) {
      const expected = weights[key] * total
      const diff = Math.abs(counts[key] - expected) / expected
      expect(diff).toBeLessThan(0.05)
    }
  })
})
