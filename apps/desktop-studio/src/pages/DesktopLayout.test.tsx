import { describe, it, expect } from 'vitest'
import DesktopLayout from './DesktopLayout'
import { render } from '@testing-library/react'

describe('DesktopLayout', () => {
  it('renders children', () => {
    const { getByText } = render(<DesktopLayout><span>child</span></DesktopLayout>)
    expect(getByText('child')).toBeTruthy()
  })
})
