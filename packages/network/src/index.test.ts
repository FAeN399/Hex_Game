import { describe, it, expect } from 'vitest'
import { validateMessage } from './index'

const valid = { type: 'ping', payload: { ok: true }, seq: 1 }

describe('validateMessage', () => {
  it('accepts valid messages', () => {
    expect(validateMessage(valid).seq).toBe(1)
  })

  it('rejects bad messages', () => {
    expect(() => validateMessage({})).toThrow()
  })
})
