import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { Card } from './Card'
import { render } from '@testing-library/react'

describe('Card', () => {
  it('renders title', () => {
    const { getByText } = render(<Card title="Test" />)
    expect(getByText('Test')).toBeTruthy()
  })
})
