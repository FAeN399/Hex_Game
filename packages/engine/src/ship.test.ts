import { describe, it, expect } from 'vitest'
import { aggregateShipStats } from './ship'
import type { ShipDefinition } from '../../schema/src'

const ship: ShipDefinition = {
  id: 's1',
  name: 'Test',
  parts: [
    { id: 'p1', name: 'Hull', type: 'hull', stats: { defense: 3 } },
    { id: 'p2', name: 'Engine', type: 'engine', stats: { speed: 5 } },
    { id: 'p3', name: 'Gun', type: 'weapon', stats: { attack: 2 } }
  ]
}

describe('aggregateShipStats', () => {
  it('sums stats from parts', () => {
    const stats = aggregateShipStats(ship)
    expect(stats.speed).toBe(5)
    expect(stats.defense).toBe(3)
    expect(stats.attack).toBe(2)
    expect(stats.cargo).toBe(0)
  })
})
