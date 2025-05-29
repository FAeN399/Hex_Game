import { z } from 'zod'

export const EdgeIcon = z.enum([
  'attack',
  'defense',
  'skill',
  'resource',
  'link',
  'element'
])

export const CardType = z.enum([
  'unit',
  'hero',
  'spell',
  'relic',
  'structure'
])

export const Rarity = z.enum(['common', 'uncommon', 'rare'])

export const HexCard = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: CardType,
  rarity: Rarity,
  edges: z.tuple([
    EdgeIcon,
    EdgeIcon,
    EdgeIcon,
    EdgeIcon,
    EdgeIcon,
    EdgeIcon
  ]),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  image: z.string().url().optional()
})

export const BoosterPack = z.object({
  id: z.string().uuid(),
  playerId: z.string(),
  cards: z.array(HexCard)
})

export const Theme = z.enum(['fantasy', 'sci-fi'])

export const Terrain = z.enum([
  'plains',
  'forest',
  'mountain',
  'water',
  'desert',
  'swamp',
  'city'
])

export const TerrainType = z.object({
  id: z.string().uuid(),
  name: z.string(),
  movementCost: z.number().min(0),
  resourceOutput: z.number().min(0).optional(),
  color: z.string().optional(),
  texture: z.string().optional(),
  theme: Theme
})

export const StructureType = z.object({
  id: z.string().uuid(),
  name: z.string(),
  attributes: z.record(z.any()).default({}),
  theme: Theme
})

export const ShipPartType = z.enum([
  'hull',
  'engine',
  'weapon',
  'cargo',
  'utility'
])

export const ShipPart = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: ShipPartType,
  stats: z.object({
    speed: z.number().optional(),
    defense: z.number().optional(),
    cargo: z.number().optional(),
    attack: z.number().optional()
  }).default({}),
  skin: z.string().optional(),
  theme: Theme.optional()
})

export const ShipDefinition = z.object({
  id: z.string().uuid(),
  name: z.string(),
  parts: z.array(ShipPart)
})

export const Character = z.object({
  id: z.string().uuid(),
  name: z.string(),
  totalPower: z.number(),
  cardIds: z.array(z.string().uuid()).length(6)
})

export const Ship = z.object({
  id: z.string().uuid(),
  name: z.string(),
  partIds: z.array(z.string().uuid()).length(6)
})

export const MapTile = z.object({
  q: z.number().int(),
  r: z.number().int(),
  terrain: Terrain,
  occupantId: z.string().uuid().optional()
})

export const NetMessage = z.object({
  type: z.string(),
  payload: z.any(),
  seq: z.number().int()
})

export type EdgeIcon = z.infer<typeof EdgeIcon>
export type CardType = z.infer<typeof CardType>
export type Rarity = z.infer<typeof Rarity>
export type HexCard = z.infer<typeof HexCard>
export type BoosterPack = z.infer<typeof BoosterPack>
export type Theme = z.infer<typeof Theme>
export type TerrainType = z.infer<typeof TerrainType>
export type StructureType = z.infer<typeof StructureType>
export type ShipPartType = z.infer<typeof ShipPartType>
export type ShipPart = z.infer<typeof ShipPart>
export type ShipDefinition = z.infer<typeof ShipDefinition>
export type Character = z.infer<typeof Character>
export type Ship = z.infer<typeof Ship>
export type Terrain = z.infer<typeof Terrain>
export type MapTile = z.infer<typeof MapTile>
export type NetMessage = z.infer<typeof NetMessage>

export {
  EdgeIcon,
  CardType,
  Rarity,
  HexCard,
  BoosterPack,
  Theme,
  Terrain,
  TerrainType,
  StructureType,
  ShipPartType,
  ShipPart,
  ShipDefinition,
  Character,
  Ship,
  MapTile,
  NetMessage
}
