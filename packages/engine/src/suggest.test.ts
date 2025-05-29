import { describe, it, expect } from 'vitest'
import { suggestCard } from './suggest'
import type { HexCardType } from 'schema'

const card = (id: string, edge: string[]): HexCardType => ({
  id,
  name: id,
  type: 'unit',
  rarity: 'common',
  edges: edge as any,
  tags: []
})

describe('suggestCard', () => {
  const deck: HexCardType[] = [
    card('a', ['attack','attack','attack','attack','attack','attack']),
    card('b', ['defense','defense','defense','defense','defense','defense']),
    card('c', ['attack','defense','skill','resource','link','element'])
  ]

  it('suggests card with matching edges', () => {
    const selected = [deck[0], null, null, null, null, null]
    const suggestion = suggestCard(selected, deck)
    expect(suggestion?.id).toBe('c')
  })

  it('returns null when deck empty', () => {
    expect(suggestCard([], [])).toBeNull()
  })
})
