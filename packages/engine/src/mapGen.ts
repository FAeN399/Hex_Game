import { MapTileType, TerrainEnumType, MapTile } from 'schema'

export interface MapGenOptions {
  width: number
  height: number
  terrainWeights: Partial<Record<TerrainEnumType, number>>
  seed?: number
  roughness?: number
  theme: 'fantasy' | 'sci-fi'
}

function mulberry32(a: number): () => number {
  return function() {
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export function generateMap(options: MapGenOptions): MapTileType[] {
  const {
    width,
    height,
    terrainWeights,
    seed = Date.now(),
  } = options
  const rng = mulberry32(seed)
  const entries = Object.entries(terrainWeights) as [TerrainEnumType, number][]
  const total = entries.reduce((s, [, w]) => s + w, 0)
  const pick = () => {
    const r = rng() * total
    let acc = 0
    for (const [terrain, weight] of entries) {
      acc += weight
      if (r <= acc) return terrain
    }
    return entries[entries.length - 1][0]
  }
  const tiles: MapTileType[] = []
  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      tiles.push(MapTile.parse({ q, r, terrain: pick() }))
    }
  }
  return tiles
}
