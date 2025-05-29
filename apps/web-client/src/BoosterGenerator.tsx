import { useState } from 'react'
import { useDeckStore } from './store'
import { generateBooster } from '../../packages/engine/src/booster'
import type { BoosterPack } from '../../packages/schema/src'

export default function BoosterGenerator() {
  const cards = useDeckStore(s => s.cards)
  const addBooster = useDeckStore(s => s.addBooster)
  const [playerId, setPlayerId] = useState('')
  const [size, setSize] = useState(6)
  const [pack, setPack] = useState<BoosterPack | null>(null)

  const handleGenerate = () => {
    const newPack = generateBooster(cards, { playerId, size })
    addBooster(newPack)
    setPack(newPack)
  }

  return (
    <div>
      <h2>Generate Booster</h2>
      <div>
        <label>Player ID <input value={playerId} onChange={e=>setPlayerId(e.target.value)} /></label>
        <label>Size <input type="number" value={size} onChange={e=>setSize(Number(e.target.value))} /></label>
        <button onClick={handleGenerate}>Generate</button>
      </div>
      {pack && (
        <div>
          <h3>Booster Contents</h3>
          <ul>
            {pack.cards.map(c => (<li key={c.id}>{c.name}</li>))}
          </ul>
        </div>
      )}
    </div>
  )
}
