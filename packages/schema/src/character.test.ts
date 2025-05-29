import { describe, it, expect } from 'vitest'
import { Character } from './index'

const valid = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Hero',
  totalPower: 10,
  cardIds: Array(6).fill('00000000-0000-0000-0000-000000000000')
}

describe('Character schema', () => {
  it('parses valid', () => {
    expect(Character.parse(valid).name).toBe('Hero')
  })

  it('rejects invalid', () => {
    expect(() => Character.parse({})).toThrow()
  })
})
