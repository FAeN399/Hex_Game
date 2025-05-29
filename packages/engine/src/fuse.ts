import { randomUUID } from 'crypto'
import type { HexCardType, CharacterType, ShipObjectType } from 'schema'

/**
 * Fuse six hex cards into either a character or a ship definition.
 * Duplicate logic between the two outcomes is avoided by mapping the
 * resulting card IDs to the appropriate property.
 */
export function fuse(
  cards: HexCardType[],
  name: string,
  kind: 'character' | 'ship' = 'character'
): CharacterType | ShipObjectType {  if (cards.length !== 6) throw new Error('exactly six cards required')
  const ids = cards.map(c => c.id)
  
  if (kind === 'character') {
    // Calculate total power based on card count and rarity
    const totalPower = cards.reduce((s, c) => {
      const rarityBonus = c.rarity === 'rare' ? 3 : c.rarity === 'uncommon' ? 2 : 1
      return s + rarityBonus
    }, 0)
    return { id: randomUUID(), name, totalPower, cardIds: ids }
  }
  return { id: randomUUID(), name, partIds: ids }
}
