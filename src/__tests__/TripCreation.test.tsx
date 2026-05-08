import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TripCreation } from '../components/screens/TripCreation'

describe('TripCreation', () => {
  it('renders destination input and travel dates group', () => {
    render(<TripCreation onGenerate={vi.fn()} isGenerating={false} />)
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /travel dates/i })).toBeInTheDocument()
  })

  it('renders all chip option groups', () => {
    render(<TripCreation onGenerate={vi.fn()} isGenerating={false} />)
    expect(screen.getByRole('group', { name: /budget style/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /travel pace/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /food preferences/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /trip vibes/i })).toBeInTheDocument()
  })

  it('shows validation error when destination is empty and form is submitted', async () => {
    const user = userEvent.setup()
    render(<TripCreation onGenerate={vi.fn()} isGenerating={false} />)
    await user.click(screen.getByRole('button', { name: /plan my solo trip/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/where are you headed/i)
  })

  it('marks destination input as invalid when error is shown', async () => {
    const user = userEvent.setup()
    render(<TripCreation onGenerate={vi.fn()} isGenerating={false} />)
    await user.click(screen.getByRole('button', { name: /plan my solo trip/i }))
    expect(screen.getByLabelText(/destination/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('chip buttons have aria-pressed reflecting selection state', () => {
    render(<TripCreation onGenerate={vi.fn()} isGenerating={false} />)
    const budgetGroup = screen.getByRole('group', { name: /budget style/i })
    const shoestring = within(budgetGroup).getByRole('button', { name: /shoestring/i })
    const comfort = within(budgetGroup).getByRole('button', { name: /comfort/i })
    expect(shoestring).toHaveAttribute('aria-pressed', 'true')
    expect(comfort).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onGenerate with correct TripConstraints shape when valid', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<TripCreation onGenerate={onGenerate} isGenerating={false} />)

    await user.type(screen.getByLabelText(/destination/i), 'Tokyo')
    await user.click(screen.getByRole('button', { name: /plan my solo trip/i }))

    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'Tokyo',
        budgetTier: expect.any(String),
        pace: expect.any(String),
        dietary: expect.any(String),
        groupComposition: expect.any(String),
        groupSize: expect.any(Number),
        vibes: expect.any(Array),
      })
    )
  })

  it('displays external error from parent (e.g. API failure)', () => {
    render(
      <TripCreation
        onGenerate={vi.fn()}
        isGenerating={false}
        externalError="API quota exceeded"
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('API quota exceeded')
  })

  it('shows loading state when isGenerating is true', () => {
    render(<TripCreation onGenerate={vi.fn()} isGenerating={true} />)
    const btn = screen.getByRole('button', { name: /planning your escape/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })
})
