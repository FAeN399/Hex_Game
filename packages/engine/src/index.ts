import { randomUUID } from 'crypto'

export interface HexCard {
  id: string
  name: string
  power: number
}

export interface Character {
  id: string
  name: string
  totalPower: number
  cardIds: string[]
}

/**
 * Combine six cards into a new character.
 *
 * @param cards - exactly six cards to fuse
 * @param name  - the resulting character name
 * @returns the forged character with aggregated power
 */
export function forgeCharacter(cards: HexCard[], name: string): Character {
  if (cards.length !== 6) {
    throw new Error('exactly six cards required')
  }
  const totalPower = cards.reduce((sum, c) => sum + c.power, 0)
  return {
    id: randomUUID(),
    name,
    totalPower,
    cardIds: cards.map(c => c.id)
  }
}

export { generateBooster } from './booster'
export { fuse } from './fuse'
export { nextPhase, Phase } from './turn'
export { suggestCard } from './suggest'
