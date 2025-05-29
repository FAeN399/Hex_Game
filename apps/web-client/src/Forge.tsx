import { useState } from 'react'
import './Forge.css'

export default function Forge() {
  const [filled, setFilled] = useState(Array(6).fill(false))

  const toggleSlot = (index: number) => {
    setFilled(f => {
      const copy = [...f]
      copy[index] = !copy[index]
      return copy
    })
  }

  const allFilled = filled.every(Boolean)

  return (
    <div className="forge" data-testid="forge">
      <div className={allFilled ? 'circle lit' : 'circle'} data-testid="circle" />
      {filled.map((isFilled, idx) => (
        <button
          key={idx}
          className={isFilled ? 'hex filled' : 'hex'}
          data-testid={`hex-${idx}`}
          onClick={() => toggleSlot(idx)}
        />
      ))}
    </div>
  )
}
