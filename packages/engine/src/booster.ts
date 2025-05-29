import { randomUUID } from 'crypto'
import type { BoosterPack, CardType, HexCard, Rarity } from '../../schema/src'

export interface BoosterOptions {
  playerId: string
  size?: number
  rarityDistribution?: Partial<Record<Rarity, number>>
  allowedTypes?: CardType[]
  tags?: string[]
}

export function generateBooster(
  deck: HexCard[],
  options: BoosterOptions
): BoosterPack {
  const size = options.size ?? 6
  const distribution: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    ...options.rarityDistribution
  }
  if (distribution.common + distribution.uncommon + distribution.rare === 0) {
    distribution.common = size - 3
    distribution.uncommon = 2
    distribution.rare = 1
  }

  const filtered = deck.filter(card => {
    if (options.allowedTypes && !options.allowedTypes.includes(card.type)) {
      return false
    }
    if (options.tags && !options.tags.every(t => card.tags.includes(t))) {
      return false
    }
    return true
  })

  const byRarity: Record<Rarity, HexCard[]> = {
    common: filtered.filter(c => c.rarity === 'common'),
    uncommon: filtered.filter(c => c.rarity === 'uncommon'),
    rare: filtered.filter(c => c.rarity === 'rare')
  }

  const chosen: HexCard[] = []
  for (const rarity of Object.keys(distribution) as Rarity[]) {
    const count = distribution[rarity]
    const pool = byRarity[rarity]
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      chosen.push(pool.splice(idx, 1)[0])
    }
  }

  while (chosen.length < size && filtered.length > 0) {
    const idx = Math.floor(Math.random() * filtered.length)
    const card = filtered.splice(idx, 1)[0]
    if (!chosen.includes(card)) chosen.push(card)
  }

  return {
    id: randomUUID(),
    playerId: options.playerId,
    cards: chosen.slice(0, size)
  }
}

export type { BoosterPack }
