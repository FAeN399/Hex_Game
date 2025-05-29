import { useState } from 'react'
import { randomUUID } from 'crypto'
import {
  EdgeIcon,
  CardType,
  Rarity,
  HexCard as HexCardSchema
} from '../../packages/schema/src'
import { useDeckStore } from './store'

export default function CardCreator() {
  const addCard = useDeckStore(s => s.addCard)
  const [name, setName] = useState('')
  const [type, setType] = useState<CardType>('unit')
  const [rarity, setRarity] = useState<Rarity>('common')
  const [edges, setEdges] = useState<EdgeIcon[]>([
    'attack',
    'defense',
    'skill',
    'resource',
    'link',
    'element'
  ])
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const updateEdge = (i: number, val: EdgeIcon) => {
    const copy = [...edges]
    copy[i] = val
    setEdges(copy)
  }

  const handleSubmit = () => {
    const card = {
      id: randomUUID(),
      name,
      type,
      rarity,
      edges: edges as [EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon],
      tags: tags.split(',').filter(t => t),
      description
    }
    const parsed = HexCardSchema.safeParse(card)
    if (!parsed.success) {
      setError('Invalid card data')
      return
    }
    addCard(parsed.data)
    setName('')
    setTags('')
    setDescription('')
  }

  return (
    <div>
      <h2>New Card</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div>
        <label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label>
      </div>
      <div>
        <label>Type
          <select value={type} onChange={e=>setType(e.target.value as CardType)}>
            {CardType.options.map(opt=>(
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>Rarity
          <select value={rarity} onChange={e=>setRarity(e.target.value as Rarity)}>
            {Rarity.options.map(r=>(<option key={r} value={r}>{r}</option>))}
          </select>
        </label>
      </div>
      <div>
        Edges:
        {edges.map((edge,i)=>(
          <select key={i} value={edge} onChange={e=>updateEdge(i, e.target.value as EdgeIcon)}>
            {EdgeIcon.options.map(o=>(<option key={o} value={o}>{o}</option>))}
          </select>
        ))}
      </div>
      <div>
        <label>Tags <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="comma separated" /></label>
      </div>
      <div>
        <label>Description <input value={description} onChange={e=>setDescription(e.target.value)} /></label>
      </div>
      <button onClick={handleSubmit}>Save Card</button>
      <pre>{JSON.stringify({name,type,rarity,edges,tags:tags.split(',')},null,2)}</pre>
    </div>
  )
}
