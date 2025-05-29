import type { TerrainTypeObjectType, ThemeType } from 'schema'

export interface HexTile {
  q: number
  r: number
  terrain: TerrainTypeObjectType
  elevation?: number
  tags?: string[]
}

export interface TerrainDistribution {
  type: TerrainTypeObjectType
  weight: number
}

export interface RandomMapOptions {
  width: number
  height: number
  terrains: TerrainDistribution[]
  theme?: ThemeType
}

export function generateRandomMap(opts: RandomMapOptions): HexTile[][] {
  const pool = opts.theme
    ? opts.terrains.filter(t => t.type.theme === opts.theme)
    : opts.terrains
  const total = pool.reduce((sum, t) => sum + t.weight, 0)
  const choose = (): TerrainTypeObjectType => {
    const r = Math.random() * total
    let acc = 0
    for (const item of pool) {
      acc += item.weight
      if (r <= acc) return item.type
    }
    return pool[pool.length - 1].type
  }

  const map: HexTile[][] = []
  for (let y = 0; y < opts.height; y++) {
    const row: HexTile[] = []
    for (let x = 0; x < opts.width; x++) {
      row.push({ q: x, r: y, terrain: choose() })
    }
    map.push(row)
  }
  return map
}
