import Forge from './Forge'
import CreateDistribute from './CreateDistribute'
import { useState } from 'react'

export default function App() {
  const [tab, setTab] = useState<'forge'|'create'>('forge')
  return (
    <div>
      <button onClick={()=>setTab('forge')}>Forge</button>
      <button onClick={()=>setTab('create')}>Create &amp; Distribute</button>
      {tab === 'forge' ? (
        <div>
          <h1>Hello Forge</h1>
          <Forge />
        </div>
      ) : (
        <CreateDistribute />
      )}
    </div>
  )
}
