import { useState, useCallback, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  AdaptiveTrip, AppScreen, GeminiActivity, GeminiActivityType,
  ItineraryTimeSlot, TripConstraints, TripDay,
} from '../types/trip'
import { sanitizeInput, sanitizeOutput } from '../utils/sanitize'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not configured')

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: 'You are Roamly, an expert travel planning AI. Always respond with valid JSON matching the requested schema exactly.',
  generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
})

export interface UseGeminiReturn {
  trip: AdaptiveTrip | null
  appScreen: AppScreen
  error: string | null
  streamingStatus: string[]
  geminiActivities: GeminiActivity[]
  generateItinerary: (constraints: TripConstraints) => Promise<void>
  replanItinerary: (disruption: string, disruptionId?: string) => Promise<void>
  resetToCreation: () => void
}

const STATUS_DELAYS = [0, 500, 1100, 1800, 2600, 3400, 4200, 5000]

function buildStatusMessages(constraints: TripConstraints): string[] {
  const month = constraints.startDate
    ? new Date(constraints.startDate).toLocaleString('default', { month: 'long' })
    : 'seasonal'
  const start = new Date(constraints.startDate)
  const end = new Date(constraints.endDate)
  const numDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))

  return [
    `Analyzing ${sanitizeInput(constraints.destination)} travel data...`,
    `Checking ${month} weather patterns...`,
    `Mapping ${numDays}-day route efficiency...`,
    constraints.dietary !== 'No restrictions'
      ? `Finding ${constraints.dietary.toLowerCase()} dining options...`
      : 'Curating top dining experiences...',
    `Calculating ₹${constraints.budgetINR.toLocaleString('en-IN')} budget allocation...`,
    `Optimizing ${constraints.pace.toLowerCase()} pace itinerary...`,
    constraints.vibes.length > 0
      ? `Scoring ${constraints.vibes.slice(0, 2).join(' & ').toLowerCase()} activity matches...`
      : 'Scoring activity matches...',
    'Finalizing your personalized adaptive plan...',
  ]
}

function pushActivity(
  type: GeminiActivityType,
  message: string,
  setter: Dispatch<SetStateAction<GeminiActivity[]>>,
) {
  setter(prev => [
    {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
    },
    ...prev.slice(0, 49),
  ])
}

function parseAdaptiveTrip(text: string): AdaptiveTrip {
  const parsed: unknown = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Response is not an object')

  const raw = parsed as Record<string, unknown>

  if (!Array.isArray(raw.days)) throw new Error('Missing days array in response')

  const days: TripDay[] = (raw.days as unknown[]).map((d: unknown, i: number) => {
    if (typeof d !== 'object' || d === null) throw new Error(`Invalid day at index ${i}`)
    const day = d as Record<string, unknown>
    if (!Array.isArray(day.slots)) throw new Error(`Missing slots for day ${i + 1}`)

    const slots: ItineraryTimeSlot[] = (day.slots as unknown[]).map((s: unknown) => {
      if (typeof s !== 'object' || s === null) throw new Error('Invalid slot object')
      const slot = s as Record<string, unknown>
      const period = String(slot.period ?? 'morning')
      const validPeriods = ['morning', 'afternoon', 'evening', 'night']
      return {
        period: (validPeriods.includes(period) ? period : 'morning') as ItineraryTimeSlot['period'],
        location: sanitizeOutput(String(slot.location ?? '')),
        activity: sanitizeOutput(String(slot.activity ?? '')),
        estimatedCostINR: Number(slot.estimatedCostINR ?? 0),
        travelDuration: sanitizeOutput(String(slot.travelDuration ?? '')),
        weather: sanitizeOutput(String(slot.weather ?? '')),
        tags: Array.isArray(slot.tags) ? (slot.tags as unknown[]).map(t => sanitizeOutput(String(t))) : [],
        geminiReasoning: sanitizeOutput(String(slot.geminiReasoning ?? '')),
        revised: Boolean(slot.revised),
      }
    })

    return {
      day: Number(day.day ?? i + 1),
      date: sanitizeOutput(String(day.date ?? '')),
      slots,
    }
  })

  const rawSummary = (typeof raw.summary === 'object' && raw.summary !== null)
    ? raw.summary as Record<string, unknown>
    : {}

  const walkingRaw = String(rawSummary.walkingIntensity ?? 'medium')
  const validWalking = ['low', 'medium', 'high']

  const summary = {
    totalBudget: Number(rawSummary.totalBudget ?? 0),
    spentBudget: Number(rawSummary.spentBudget ?? 0),
    weatherOverview: sanitizeOutput(String(rawSummary.weatherOverview ?? '')),
    walkingIntensity: (validWalking.includes(walkingRaw) ? walkingRaw : 'medium') as 'low' | 'medium' | 'high',
    travelEfficiencyScore: Math.min(100, Math.max(0, Number(rawSummary.travelEfficiencyScore ?? 75))),
    geminiConfidenceScore: Math.min(100, Math.max(0, Number(rawSummary.geminiConfidenceScore ?? 80))),
  }

  return {
    destination: sanitizeOutput(String(raw.destination ?? '')),
    days,
    summary,
  }
}

const DISRUPTION_ACTIVITY_TEMPLATES: Record<string, string[]> = {
  rain: [
    'Removing outdoor activities from tomorrow\'s plan...',
    'Finding indoor alternatives nearby...',
    'Recalculating transit routes for indoor venues...',
    'Updating budget for indoor experiences...',
  ],
  closed: [
    'Removing closed venue from itinerary...',
    'Searching for similar nearby alternatives...',
    'Optimizing route around new location...',
    'Recalculating estimated costs...',
  ],
  flight: [
    'Adjusting Day 1 arrival timeline...',
    'Compressing first-day activities...',
    'Finding late-arrival dining options...',
    'Recalculating Day 1 budget...',
  ],
  budget: [
    'Identifying cost-reduction opportunities...',
    'Finding budget alternatives for premium venues...',
    'Recalculating daily spend limits...',
    'Optimizing remaining budget allocation...',
  ],
  joined: [
    'Scaling group size adjustments...',
    'Recalculating per-person costs...',
    'Finding larger venue alternatives...',
    'Updating accommodation considerations...',
  ],
  crowd: [
    'Flagging overcrowded attraction...',
    'Finding alternative with similar experience...',
    'Adjusting timing to avoid peak hours...',
    'Updating route to reduce transit...',
  ],
}

const DEFAULT_DISRUPTION_ACTIVITIES = [
  'Analyzing disruption impact...',
  'Identifying affected activities...',
  'Finding alternatives...',
  'Recalculating plan...',
]

export function useGemini(): UseGeminiReturn {
  const [trip, setTrip] = useState<AdaptiveTrip | null>(null)
  const [appScreen, setAppScreen] = useState<AppScreen>('creation')
  const [error, setError] = useState<string | null>(null)
  const [streamingStatus, setStreamingStatus] = useState<string[]>([])
  const [geminiActivities, setGeminiActivities] = useState<GeminiActivity[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const currentTripRef = useRef<AdaptiveTrip | null>(null)
  const statusTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearStatusTimers = useCallback(() => {
    statusTimersRef.current.forEach(clearTimeout)
    statusTimersRef.current = []
  }, [])

  const runStatusAnimation = useCallback((messages: string[]) => {
    clearStatusTimers()
    messages.forEach((msg, i) => {
      const t = setTimeout(() => {
        setStreamingStatus(prev => [...prev, msg])
      }, STATUS_DELAYS[i] ?? STATUS_DELAYS[STATUS_DELAYS.length - 1] + i * 800)
      statusTimersRef.current.push(t)
    })
  }, [clearStatusTimers])

  const generateItinerary = useCallback(async (constraints: TripConstraints): Promise<void> => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setAppScreen('generating')
    setError(null)
    setStreamingStatus([])
    setGeminiActivities([])

    const messages = buildStatusMessages(constraints)
    runStatusAnimation(messages)

    const numDays = Math.max(1, Math.round(
      (new Date(constraints.endDate).getTime() - new Date(constraints.startDate).getTime()) / 86400000
    ))

    const prompt = `Generate a travel itinerary for Roamly.

Trip details:
- Destination: ${sanitizeInput(constraints.destination)}
- Dates: ${constraints.startDate} to ${constraints.endDate} (${numDays} days)
- Budget tier: ${constraints.budgetTier} (approx ₹${constraints.budgetINR} total)
- Travel pace: ${constraints.pace}
- Group: ${constraints.groupComposition}, ${constraints.groupSize} people
- Dietary preference: ${constraints.dietary}
- Vibe preferences: ${constraints.vibes.join(', ') || 'none specified'}
- Special request: ${sanitizeInput(constraints.freeformPrompt) || 'none'}

Required JSON schema:
{
  "destination": string,
  "days": [{
    "day": number,
    "date": "YYYY-MM-DD",
    "slots": [{
      "period": "morning" | "afternoon" | "evening" | "night",
      "location": string,
      "activity": string,
      "estimatedCostINR": number,
      "travelDuration": string,
      "weather": string,
      "tags": string[],
      "geminiReasoning": string,
      "revised": false
    }]
  }],
  "summary": {
    "totalBudget": ${constraints.budgetINR},
    "spentBudget": number,
    "weatherOverview": string,
    "walkingIntensity": "low" | "medium" | "high",
    "travelEfficiencyScore": number,
    "geminiConfidenceScore": number
  }
}

Rules:
1. Each day must have 3-4 slots (morning, afternoon, evening, optionally night)
2. travelDuration is from the PREVIOUS slot's location
3. geminiReasoning must reference the user's stated preferences
4. estimatedCostINR values must sum to approximately spentBudget
5. tags must only be: vegetarian, vegan, indoor, outdoor, cultural, adventure, relaxed, nightlife, kid-friendly, accessible`

    try {
      const result = await model.generateContent(prompt)
      if (controller.signal.aborted) return

      clearStatusTimers()
      const text = result.response.text()
      const parsed = parseAdaptiveTrip(text)

      currentTripRef.current = parsed
      setTrip(parsed)

      pushActivity('optimization', `Generated ${parsed.days.length}-day itinerary for ${parsed.destination}`, setGeminiActivities)
      pushActivity('calculation', `Budget allocation: ₹${parsed.summary.spentBudget.toLocaleString('en-IN')} of ₹${parsed.summary.totalBudget.toLocaleString('en-IN')}`, setGeminiActivities)
      pushActivity('decision', `Confidence score: ${parsed.summary.geminiConfidenceScore}%`, setGeminiActivities)

      setAppScreen('dashboard')
    } catch (err: unknown) {
      if (controller.signal.aborted) return
      clearStatusTimers()
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      setAppScreen('creation')
    }
  }, [runStatusAnimation, clearStatusTimers])

  const replanItinerary = useCallback(async (disruption: string, disruptionId?: string): Promise<void> => {
    if (!currentTripRef.current) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setAppScreen('disruption-adapting')
    setError(null)

    const activityMessages = disruptionId && DISRUPTION_ACTIVITY_TEMPLATES[disruptionId]
      ? DISRUPTION_ACTIVITY_TEMPLATES[disruptionId]
      : DEFAULT_DISRUPTION_ACTIVITIES

    activityMessages.forEach((msg, i) => {
      setTimeout(() => {
        if (!controller.signal.aborted) {
          pushActivity(i === 0 ? 'alert' : i % 2 === 0 ? 'optimization' : 'decision', msg, setGeminiActivities)
        }
      }, i * 400)
    })

    const contextTrip = {
      ...currentTripRef.current,
      days: currentTripRef.current.days.map(d => ({
        ...d,
        slots: d.slots.map(s => ({
          ...s,
          geminiReasoning: '',
        })),
      })),
    }

    const prompt = `Adapt this travel itinerary due to a disruption.

Current itinerary:
${JSON.stringify(contextTrip)}

Disruption: ${sanitizeInput(disruption)}

Return the same JSON structure with these rules:
1. Set revised:true only on slots that actually changed
2. Maintain budget constraints where possible
3. In geminiReasoning for revised slots, explain why this replacement was chosen
4. Update summary.spentBudget and summary.geminiConfidenceScore to reflect changes
5. Keep all unaffected days and slots exactly as they are (revised: false)
6. Return the complete structure, not just changed days`

    try {
      const result = await model.generateContent(prompt)
      if (controller.signal.aborted) return

      const text = result.response.text()
      const parsed = parseAdaptiveTrip(text)

      currentTripRef.current = parsed
      setTrip(parsed)

      const revisedCount = parsed.days.flatMap(d => d.slots).filter(s => s.revised).length
      pushActivity('calculation', `Recalculated: ${revisedCount} activities updated`, setGeminiActivities)
      pushActivity('optimization', `New confidence score: ${parsed.summary.geminiConfidenceScore}%`, setGeminiActivities)

      setAppScreen('dashboard')
    } catch (err: unknown) {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Replan failed'
      setError(message)
      setAppScreen('dashboard')
    }
  }, [])

  const resetToCreation = useCallback(() => {
    abortControllerRef.current?.abort()
    clearStatusTimers()
    setTrip(null)
    setAppScreen('creation')
    setError(null)
    setStreamingStatus([])
    setGeminiActivities([])
    currentTripRef.current = null
  }, [clearStatusTimers])

  return {
    trip,
    appScreen,
    error,
    streamingStatus,
    geminiActivities,
    generateItinerary,
    replanItinerary,
    resetToCreation,
  }
}
