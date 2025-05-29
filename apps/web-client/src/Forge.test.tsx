import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Forge from './Forge'

describe('Forge', () => {
  it('lights circle when all hexes filled', () => {
    render(<Forge />)
    const hexes = [0,1,2,3,4,5].map(i => screen.getByTestId(`hex-${i}`))
    const circle = screen.getByTestId('circle')
    hexes.forEach(hex => fireEvent.click(hex))
    expect(circle.classList.contains('lit')).toBe(true)
  })
})
