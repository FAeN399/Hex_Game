import { describe, it, expect } from 'vitest'
import { HexCard } from './index'

const valid = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Test',
  type: 'unit',
  rarity: 'common',
  edges: ['attack','defense','skill','resource','link','element'],
  tags: []
}

describe('HexCard schema', () => {
  it('accepts valid card', () => {
    expect(HexCard.parse(valid).name).toBe('Test')
  })

  it('rejects invalid card', () => {
    const bad = { ...valid, edges: ['attack'] }
    expect(() => HexCard.parse(bad as any)).toThrow()
  })
})
