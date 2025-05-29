import type { HexCard, EdgeIcon } from '../../schema/src'

/**
 * Recommend a card from `deck` that best matches the edges of
 * the currently selected cards. Cards already in `selected` are ignored.
 * Returns `null` if deck is empty or no cards are available.
 */
export function suggestCard(selected: Array<HexCard | null>, deck: HexCard[]): HexCard | null {
  if (deck.length === 0) return null

  // Gather edge frequencies from the selected cards
  const counts: Partial<Record<EdgeIcon, number>> = {}
  for (const card of selected) {
    if (!card) continue
    card.edges.forEach(edge => {
      counts[edge] = (counts[edge] ?? 0) + 1
    })
  }

  // Filter out cards already selected
  const usedIds = new Set(selected.filter(Boolean).map(c => (c as HexCard).id))
  const candidates = deck.filter(c => !usedIds.has(c.id))
  if (candidates.length === 0) return null

  let best: HexCard | null = null
  let bestScore = -1
  for (const card of candidates) {
    const score = card.edges.reduce((s, e) => s + (counts[e] ?? 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = card
    }
  }

  return best
}
