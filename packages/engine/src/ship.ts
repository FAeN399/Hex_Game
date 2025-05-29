import type { ShipDefinitionType } from 'schema'

export interface ShipStats {
  speed: number
  defense: number
  cargo: number
  attack: number
}

const empty: ShipStats = { speed: 0, defense: 0, cargo: 0, attack: 0 }

export function aggregateShipStats(ship: ShipDefinitionType): ShipStats {
  return ship.parts.reduce((acc, part) => {
    const stats = part.stats
    acc.speed += stats.speed ?? 0
    acc.defense += stats.defense ?? 0
    acc.cargo += stats.cargo ?? 0
    acc.attack += stats.attack ?? 0
    return acc
  }, { ...empty })
}
