import type { HexCard } from './forgeSchema'

export type Slot = 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight'
export type Equipped = Record<Slot, HexCard | null>

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function computeStatsAndClass(equipped: Equipped) {
  let strength = 0
  let agility = 0
  let intellect = 0
  const elements: Record<string, number> = {}

  Object.values(equipped).forEach(card => {
    if (!card) return
    const attr = card.attributes
    strength += attr.strength ?? 0
    agility += attr.agility ?? 0
    intellect += attr.intellect ?? 0
    if (attr.element) {
      elements[attr.element] = (elements[attr.element] ?? 0) + 1
    }
  })

  let classLabel = 'Adventurer'
  for (const [el, count] of Object.entries(elements)) {
    if (count >= 3) {
      classLabel = `${capitalize(el)} Mage`
      break
    }
  }

  return {
    stats: { strength, agility, intellect },
    classLabel
  }
}
