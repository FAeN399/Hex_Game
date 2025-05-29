import { z } from 'zod'
import type { Character } from '../../schema/src'

// Character psychological attribute definition
export const CharacterAttributes = z.object({
  fear: z.number().min(0).max(10),
  inspire: z.number().min(0).max(10),
  mindControl: z.number().min(0).max(10)
})
export type CharacterAttributes = z.infer<typeof CharacterAttributes>

// Character profile combines base character and attributes
export interface CharacterProfile {
  base: Character
  attributes: CharacterAttributes
}

// Story event types for automatic sequences
export type StoryEvent =
  | { type: 'dream'; text: string }
  | { type: 'quest'; text: string }
  | { type: 'environment'; text: string }

/**
 * Generate narrative events from a character's attributes.
 * High attribute scores trigger unique effects between sessions.
 */
export function generateAttributeEvents(profile: CharacterProfile): StoryEvent[] {
  const events: StoryEvent[] = []
  const { fear, inspire, mindControl } = profile.attributes
  const name = profile.base.name

  if (fear > 7) {
    events.push({ type: 'dream', text: `${name} suffers vivid nightmares that hint at hidden fears.` })
  }
  if (inspire > 5) {
    events.push({ type: 'quest', text: `${name} feels a surge of inspiration and seeks a personal quest.` })
  }
  if (mindControl > 6) {
    events.push({ type: 'environment', text: `Strange whispers follow ${name}, warping the surroundings.` })
  }
  return events
}

export interface Scenario {
  description: string
}

export interface PlayerDecision {
  characterId: string
  decision: string
}

/**
 * Combine scenario prompts and player decisions with automatic
 * attribute-driven events to produce session narratives.
 */
export function scriptAutomaticEvents(
  profiles: CharacterProfile[],
  scenario: Scenario,
  decisions: PlayerDecision[]
): StoryEvent[] {
  const result: StoryEvent[] = []

  for (const dec of decisions) {
    const profile = profiles.find(p => p.base.id === dec.characterId)
    if (!profile) continue
    result.push(...generateAttributeEvents(profile))
    result.push({
      type: 'quest',
      text: `${profile.base.name} decides to ${dec.decision} in response to ${scenario.description}.`
    })
  }

  return result
}

export { Character } from '../../schema/src'
