import { z } from 'zod'

export const HexCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['weapon', 'armor', 'element', 'psyche', 'artifact']),
  attributes: z.object({
    strength: z.number().optional(),
    agility: z.number().optional(),
    intellect: z.number().optional(),
    element: z.enum(['fire', 'ice', 'lightning', 'earth']).optional(),
    ability: z.string().optional()
  })
})

export type HexCard = z.infer<typeof HexCardSchema>

export const EquippedSlots = z.object({
  topLeft: z.union([HexCardSchema, z.null()]),
  top: z.union([HexCardSchema, z.null()]),
  topRight: z.union([HexCardSchema, z.null()]),
  bottomLeft: z.union([HexCardSchema, z.null()]),
  bottom: z.union([HexCardSchema, z.null()]),
  bottomRight: z.union([HexCardSchema, z.null()])
})

export const ForgedHeroSchema = z.object({
  name: z.string(),
  equippedCards: EquippedSlots.refine(
    s => Object.values(s).every(Boolean),
    { message: 'All sockets must be filled' }
  ),
  finalStats: z.object({
    strength: z.number(),
    agility: z.number(),
    intellect: z.number()
  }),
  classLabel: z.string()
})

export type ForgedHero = z.infer<typeof ForgedHeroSchema>
