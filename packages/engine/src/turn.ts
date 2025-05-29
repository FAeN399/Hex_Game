import { z } from 'zod'

/**
 * Available phases of a player's turn. The order
 * represents the natural progression through a single turn.
 */
export const Phase = z.enum(['upkeep', 'hero', 'action', 'combat', 'cleanup'])
export type Phase = z.infer<typeof Phase>

/**
 * Turn state tracks the current turn number and phase.
 */
export interface TurnState {
  turn: number
  phase: Phase
}

const sequence: Phase[] = ['upkeep', 'hero', 'action', 'combat', 'cleanup']

/**
 * Advance the turn state to the next phase.
 * When cleanup is reached, the turn counter is incremented
 * and the phase cycles back to upkeep.
 */
export function nextPhase(state: TurnState): TurnState {
  const idx = sequence.indexOf(state.phase)
  const nextIdx = (idx + 1) % sequence.length
  const nextPhase = sequence[nextIdx]
  return {
    turn: nextPhase === 'upkeep' ? state.turn + 1 : state.turn,
    phase: nextPhase
  }
}
