import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Home from '@/app/page'

test('renders landing page with product name', () => {
  render(<Home />)
  expect(screen.getAllByText('VyaapaarBill')[0]).toBeInTheDocument()
})
