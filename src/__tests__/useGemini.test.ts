import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockGenerateContent = vi.hoisted(() => vi.fn())

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}))

vi.mock('../hooks/useTrips', () => ({
  saveTrip: vi.fn().mockResolvedValue('mock-trip-id'),
}))

import { useGemini } from '../hooks/useGemini'
import type { AdaptiveTrip, TripConstraints } from '../types/trip'

const mockConstraints: TripConstraints = {
  destination: 'Goa',
  startDate: '2025-06-01',
  endDate: '2025-06-04',
  budgetTier: 'Mid-range',
  budgetINR: 30000,
  pace: 'Moderate',
  dietary: 'No restrictions',
  groupComposition: 'Couple',
  groupSize: 2,
  vibes: ['Outdoor'],
  freeformPrompt: '',
}

const mockTrip: AdaptiveTrip = {
  destination: 'Goa',
  days: [
    {
      day: 1,
      date: '2025-06-01',
      slots: [
        {
          period: 'morning',
          location: 'Baga Beach',
          activity: 'Beach walk',
          estimatedCostINR: 0,
          travelDuration: '10 min walk',
          weather: 'Sunny, 32°C',
          tags: ['outdoor'],
          geminiReasoning: 'Popular beach for couples',
          revised: false,
        },
      ],
    },
  ],
  summary: {
    totalBudget: 30000,
    spentBudget: 25000,
    weatherOverview: 'Sunny throughout',
    walkingIntensity: 'medium',
    travelEfficiencyScore: 88,
    geminiConfidenceScore: 92,
  },
}

describe('useGemini', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('transitions appScreen to generating immediately on call', () => {
    mockGenerateContent.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useGemini())

    act(() => {
      void result.current.generateItinerary(mockConstraints)
    })

    expect(result.current.appScreen).toBe('generating')
  })

  it('transitions to dashboard with trip data on successful response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockTrip) },
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('dashboard')
    expect(result.current.trip).not.toBeNull()
    expect(result.current.trip?.destination).toBe('Goa')
  })

  it('returns to creation screen and sets error on failed response', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'))

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('creation')
    expect(result.current.error).toBe('API quota exceeded')
  })

  it('resets to creation screen on resetToCreation', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockTrip) },
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    act(() => {
      result.current.resetToCreation()
    })

    expect(result.current.appScreen).toBe('creation')
    expect(result.current.trip).toBeNull()
  })

  it('sets error when Gemini returns malformed JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'not valid json at all' },
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('creation')
    expect(result.current.error).toBeTruthy()
  })

  it('sets error when JSON is valid but missing required days array', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify({ destination: 'Goa', summary: {} }) },
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('creation')
    expect(result.current.error).toMatch(/missing days/i)
  })

  it('replans itinerary and transitions to disruption-adapting then dashboard', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockTrip) },
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.generateItinerary(mockConstraints)
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('dashboard')

    const revisedTrip: AdaptiveTrip = {
      ...mockTrip,
      days: [
        {
          ...mockTrip.days[0],
          slots: [{ ...mockTrip.days[0].slots[0], revised: true, activity: 'Indoor museum visit' }],
        },
      ],
    }

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(revisedTrip) },
    })

    await act(async () => {
      await result.current.replanItinerary('Heavy rain forecast', 'rain')
      vi.runAllTimers()
    })

    expect(result.current.appScreen).toBe('dashboard')
    expect(result.current.trip?.days[0].slots[0].revised).toBe(true)
  })
})
