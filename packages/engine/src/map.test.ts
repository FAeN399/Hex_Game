import { describe, it, expect } from 'vitest'
import { generateRandomMap } from './map'
import type { TerrainType } from '../../schema/src'

const grass: TerrainType = {
  id: 't1',
  name: 'Grass',
  movementCost: 1,
  theme: 'fantasy'
}

describe('generateRandomMap', () => {
  it('creates grid with given size', () => {
    const grid = generateRandomMap({
      width: 2,
      height: 2,
      terrains: [{ type: grass, weight: 1 }]
    })
    expect(grid).toHaveLength(2)
    expect(grid[0]).toHaveLength(2)
    expect(grid[1][1].terrain.name).toBe('Grass')
  })
})
