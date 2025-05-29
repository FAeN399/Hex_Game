import { describe, it, expect } from 'vitest'
import { generateAttributeEvents, scriptAutomaticEvents } from './index'
import type { CharacterProfile } from './index'

const baseChar = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Mira',
  totalPower: 0,
  cardIds: Array(6).fill('00000000-0000-0000-0000-000000000000')
}

describe('generateAttributeEvents', () => {
  it('creates events for high attributes', () => {
    const profile: CharacterProfile = {
      base: baseChar,
      attributes: { fear: 8, inspire: 6, mindControl: 7 }
    }
    const events = generateAttributeEvents(profile)
    expect(events.length).toBeGreaterThan(0)
  })
})

describe('scriptAutomaticEvents', () => {
  it('combines decisions and attribute events', () => {
    const profile: CharacterProfile = {
      base: baseChar,
      attributes: { fear: 0, inspire: 5, mindControl: 0 }
    }
    const scenario = { description: 'a looming storm' }
    const events = scriptAutomaticEvents(
      [profile],
      scenario,
      [{ characterId: baseChar.id, decision: 'seek shelter' }]
    )
    expect(events.some(e => e.type === 'quest')).toBe(true)
  })
})
