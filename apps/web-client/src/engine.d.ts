declare module '@hexcard/engine' {
  import type { HexCard } from '@hexcard/schema'

  export type Phase = 'upkeep' | 'hero' | 'action' | 'combat' | 'cleanup'
  export interface TurnState { turn: number; phase: Phase }

  export function suggestCard(selected: Array<HexCard | null>, deck: HexCard[]): HexCard | null
  export function nextPhase(state: TurnState): TurnState
}
