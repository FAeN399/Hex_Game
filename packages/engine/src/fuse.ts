import { randomUUID } from 'crypto'
import type { HexCard, Character, Ship } from '../../schema/src'

export function fuse(cards: HexCard[], name: string, kind: 'character' | 'ship' = 'character'): Character | Ship {
  if (cards.length !== 6) throw new Error('exactly six cards required')
  if (kind === 'character') {
    const totalPower = cards.reduce((s, c) => s + (c.power || 0), 0)
    return { id: randomUUID(), name, totalPower, cardIds: cards.map(c => c.id) }
  }
  return { id: randomUUID(), name, partIds: cards.map(c => c.id) }
}
