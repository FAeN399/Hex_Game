import { describe, it, expect } from 'vitest'
import { nextPhase, TurnState } from './turn'

const start: TurnState = { turn: 1, phase: 'upkeep' }

describe('nextPhase', () => {
  it('cycles through phases and increments turn', () => {
    const afterHero = nextPhase(start)
    expect(afterHero).toEqual({ turn: 1, phase: 'hero' })

    const afterAction = nextPhase(afterHero)
    expect(afterAction.phase).toBe('action')

    const afterCombat = nextPhase(afterAction)
    expect(afterCombat.phase).toBe('combat')

    const afterCleanup = nextPhase(afterCombat)
    expect(afterCleanup.phase).toBe('cleanup')

    const nextTurn = nextPhase(afterCleanup)
    expect(nextTurn).toEqual({ turn: 2, phase: 'upkeep' })
  })
})
