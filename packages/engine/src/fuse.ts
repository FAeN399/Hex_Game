import { randomUUID } from 'crypto'
import type { HexCard, Character, Ship } from '../../schema/src'

/**
 * Fuse six hex cards into either a character or a ship definition.
 * Duplicate logic between the two outcomes is avoided by mapping the
 * resulting card IDs to the appropriate property.
 */
export function fuse(
  cards: HexCard[],
  name: string,
  kind: 'character' | 'ship' = 'character'
): Character | Ship {
  if (cards.length !== 6) throw new Error('exactly six cards required')
  const ids = cards.map(c => c.id)
  if (kind === 'character') {
    const totalPower = cards.reduce((s, c) => s + (c.power || 0), 0)
    return { id: randomUUID(), name, totalPower, cardIds: ids }
  }
  return { id: randomUUID(), name, partIds: ids }
}
