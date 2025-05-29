import { useState } from 'react'
import { useCharacterForgeStore } from './characterForgeStore'
import type { HexCard } from './forgeSchema'
import type { Slot } from './forgeLogic'
import { ForgedHeroSchema } from './forgeSchema'
import { suggestCard } from '@hexcard/engine'

interface CharacterForgeProps {
  availableCards: HexCard[]
  onForge?: (hero: unknown) => void
}

const slotPositions: Record<Slot, string> = {
  topLeft: 'top-2 left-1/4',
  top: 'top-0 left-1/2 -translate-x-1/2',
  topRight: 'top-2 right-1/4',
  bottomLeft: 'bottom-2 left-1/4',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  bottomRight: 'bottom-2 right-1/4'
}

function HexSlot({ slot, card, onDrop }: { slot: Slot; card: HexCard | null; onDrop: (slot: Slot, card: HexCard) => void }) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text')
    if (!data) return
    const card = JSON.parse(data) as HexCard
    onDrop(slot, card)
  }
  return (
    <div
      className={`absolute w-16 h-16 flex items-center justify-center border rounded-md bg-gray-200 ${slotPositions[slot]}`}
      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {card && <span className="text-xs text-center">{card.name}</span>}
    </div>
  )
}

function CardPreview({ card }: { card: HexCard }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text', JSON.stringify(card))
  }
  return (
    <div draggable onDragStart={handleDragStart} className="border p-2 m-1 bg-white text-xs shadow cursor-move">
      {card.name}
    </div>
  )
}

function StatPreview() {
  const stats = useCharacterForgeStore((s) => s.finalStats)
  const label = useCharacterForgeStore((s) => s.classLabel)
  return (
    <div className="text-center mt-4">
      <p>STR {stats.strength}</p>
      <p>AGI {stats.agility}</p>
      <p>INT {stats.intellect}</p>
      <p className="font-bold">{label}</p>
    </div>
  )
}

function ForgeButton({ onForge }: { onForge: () => void }) {
  const equipped = useCharacterForgeStore((s) => s.equippedCards)
  const allFilled = Object.values(equipped).every(Boolean)
  return (
    <button
      disabled={!allFilled}
      onClick={onForge}
      className={`mt-4 px-4 py-2 rounded text-white ${allFilled ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`}
    >
      FORGE HERO
    </button>
  )
}

export default function CharacterForge({ availableCards, onForge }: CharacterForgeProps) {
  const name = useCharacterForgeStore((s) => s.name)
  const setName = useCharacterForgeStore((s) => s.setName)
  const equipped = useCharacterForgeStore((s) => s.equippedCards)
  const setCard = useCharacterForgeStore((s) => s.setCard)
  const finalStats = useCharacterForgeStore((s) => s.finalStats)
  const classLabel = useCharacterForgeStore((s) => s.classLabel)
  const [suggested, setSuggested] = useState<HexCard | null>(null)

  const handleForge = () => {
    const hero = {
      name,
      equippedCards: equipped,
      finalStats,
      classLabel
    }
    const parsed = ForgedHeroSchema.safeParse(hero)
    if (parsed.success) {
      onForge?.(parsed.data)
    } else {
      alert('Hero invalid: ' + parsed.error.message)
    }
  }

  const handleSuggest = () => {
    const suggestion = suggestCard(Object.values(equipped), availableCards as any)
    setSuggested(suggestion)
  }

  return (
    <div className="p-4">
      <input className="border p-1 mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hero name" />
      <div className="relative w-64 h-64 mx-auto">
        {Object.entries(equipped).map(([slot, card]) => (
          <HexSlot key={slot} slot={slot as Slot} card={card} onDrop={setCard} />
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gray-700" />
      </div>
      <StatPreview />
      <div className="flex gap-2 justify-center">
        <ForgeButton onForge={handleForge} />
        <button onClick={handleSuggest} className="mt-4 px-4 py-2 rounded bg-blue-500 text-white">
          Suggest Card
        </button>
      </div>
      {suggested && (
        <div className="text-center mt-2 text-sm" data-testid="suggestion">Suggested: {suggested.name}</div>
      )}
      <div className="flex flex-wrap mt-4">
        {availableCards.map((c) => (
          <CardPreview key={c.id} card={c} />
        ))}
      </div>
    </div>
  )
}
