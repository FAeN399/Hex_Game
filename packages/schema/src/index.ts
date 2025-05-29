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
  image: z.string().url().optional(),
  stats: z.object({
    attack: z.number().optional(),
    defense: z.number().optional(),
    speed: z.number().optional(),
    magic: z.number().optional()
  }).optional(),
  abilities: z.array(z.string()).optional(),
  artwork: z.string().optional()
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

// Type exports
export type EdgeIconType = z.infer<typeof EdgeIcon>
export type CardTypeType = z.infer<typeof CardType>
export type RarityType = z.infer<typeof Rarity>
export type HexCardType = z.infer<typeof HexCard>
export type BoosterPackType = z.infer<typeof BoosterPack>
export type ThemeType = z.infer<typeof Theme>
export type TerrainTypeObjectType = z.infer<typeof TerrainType>
export type StructureTypeObjectType = z.infer<typeof StructureType>
export type ShipPartTypeEnumType = z.infer<typeof ShipPartType>
export type ShipPartObjectType = z.infer<typeof ShipPart>
export type ShipDefinitionType = z.infer<typeof ShipDefinition>
export type CharacterType = z.infer<typeof Character>
export type ShipObjectType = z.infer<typeof Ship>
export type TerrainEnumType = z.infer<typeof Terrain>
export type MapTileType = z.infer<typeof MapTile>
export type NetMessageType = z.infer<typeof NetMessage>
