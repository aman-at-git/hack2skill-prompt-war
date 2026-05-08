import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TimelineCard } from '../components/ui/TimelineCard'
import type { ItineraryTimeSlot } from '../types/trip'

const baseSlot: ItineraryTimeSlot = {
  period: 'morning',
  location: 'Baga Beach',
  activity: 'Sunrise walk along the shoreline',
  estimatedCostINR: 0,
  travelDuration: '10 min walk',
  weather: 'Sunny, 30°C',
  tags: ['outdoor', 'relaxed'],
  geminiReasoning: 'Ideal for a relaxed outdoor morning',
  revised: false,
}

describe('TimelineCard', () => {
  it('renders location, activity, and cost', () => {
    render(<TimelineCard slot={baseSlot} dayDate="2025-06-01" isAdapting={false} />)
    expect(screen.getByText('Baga Beach')).toBeInTheDocument()
    expect(screen.getByText('Sunrise walk along the shoreline')).toBeInTheDocument()
    expect(screen.getByText(/₹0/)).toBeInTheDocument()
  })

  it('shows Revised badge when revised is true', () => {
    render(<TimelineCard slot={{ ...baseSlot, revised: true }} dayDate="2025-06-01" isAdapting={true} />)
    expect(screen.getByText('Revised')).toBeInTheDocument()
  })

  it('does not show Revised badge when revised is false', () => {
    render(<TimelineCard slot={baseSlot} dayDate="2025-06-01" isAdapting={false} />)
    expect(screen.queryByText('Revised')).not.toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<TimelineCard slot={baseSlot} dayDate="2025-06-01" isAdapting={false} />)
    expect(screen.getByText('outdoor')).toBeInTheDocument()
    expect(screen.getByText('relaxed')).toBeInTheDocument()
  })

  it('renders geminiReasoning', () => {
    render(<TimelineCard slot={baseSlot} dayDate="2025-06-01" isAdapting={false} />)
    expect(screen.getByText(/Ideal for a relaxed outdoor morning/)).toBeInTheDocument()
  })
})
