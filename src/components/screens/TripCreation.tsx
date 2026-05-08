import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Backpack, CalendarDays } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import type {
  TripConstraints, BudgetTier, TravelPace, DietaryPreference, VibeTag,
} from '../../types/trip'

interface TripCreationProps {
  onGenerate: (constraints: TripConstraints) => void
  isGenerating: boolean
  externalError?: string | null
}

const todayDate = new Date()
todayDate.setHours(0, 0, 0, 0)
const today = todayDate.toISOString().split('T')[0]
const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

const BUDGET_CHIPS: { label: string; value: BudgetTier; hint: string; inr: number }[] = [
  { label: 'Shoestring', value: 'Budget',    hint: '< ₹15k',  inr: 12000 },
  { label: 'Balanced',   value: 'Mid-range', hint: '₹15–50k', inr: 30000 },
  { label: 'Comfort',    value: 'Luxury',    hint: '₹50k+',   inr: 60000 },
]

const PACE_CHIPS: { label: string; value: TravelPace }[] = [
  { label: 'Slow & Wander', value: 'Slow' },
  { label: 'Steady',        value: 'Moderate' },
  { label: 'Pack it in',    value: 'Fast' },
]

const DIETARY_CHIPS: { label: string; value: DietaryPreference }[] = [
  { label: 'Anything goes', value: 'No restrictions' },
  { label: 'Vegetarian',    value: 'Vegetarian' },
  { label: 'Vegan',         value: 'Vegan' },
]

const VIBE_CHIPS: { label: string; value: VibeTag }[] = [
  { label: 'Outdoor',           value: 'Outdoor' },
  { label: 'Indoor',            value: 'Indoor' },
  { label: 'Nightlife',         value: 'Nightlife' },
  { label: 'Off the beaten path', value: 'Accessible' },
  { label: 'Kid-friendly',      value: 'Kid-friendly' },
]

const PLACEHOLDER_EXAMPLES = [
  'I want to wander solo through ancient temples and hole-in-the-wall noodle shops',
  'Looking for a spontaneous 5-day backpacking route through Southeast Asia',
  'Cheap eats, hostels with good vibes, and zero tourist traps',
  'Mix of hiking during the day and local bar scene at night',
]

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const fmt = (d: Date | undefined) =>
  d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const calendarClassNames = {
  root: 'w-full',
  months: 'flex gap-4 justify-center',
  month: 'relative flex flex-col gap-2 w-full',
  month_caption: 'flex justify-center items-center py-2 px-10',
  caption_label: 'text-sm font-semibold text-zinc-200',
  nav: 'hidden',
  button_previous: 'absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60 transition-colors',
  button_next: 'absolute right-0 top-1 flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60 transition-colors',
  chevron: 'w-4 h-4 fill-current',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday: 'flex-1 text-center text-[11px] text-zinc-600 uppercase py-1.5 font-medium',
  week: 'flex mt-1',
  day: 'flex-1 flex items-center justify-center p-0',
  day_button: 'w-8 h-8 text-sm rounded-lg text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer',
  selected: '[&>button]:!bg-blue-500 [&>button]:!text-white [&>button]:font-semibold',
  range_start: '[&>button]:!bg-blue-500 [&>button]:!text-white [&>button]:font-semibold',
  range_end: '[&>button]:!bg-blue-500 [&>button]:!text-white [&>button]:font-semibold',
  range_middle: 'bg-blue-500/15 [&>button]:!rounded-none [&>button]:text-blue-200',
  today: '[&>button]:ring-1 [&>button]:ring-blue-400/60',
  outside: '[&>button]:text-zinc-700 [&>button]:hover:bg-transparent [&>button]:cursor-default',
  disabled: '[&>button]:text-zinc-700 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
  hidden: 'invisible',
}

export function TripCreation({ onGenerate, isGenerating, externalError }: TripCreationProps) {
  const placeholderRef = useRef(
    PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]
  )
  const [freeformPrompt, setFreeformPrompt] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(threeDaysLater)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: todayDate,
    to: new Date(Date.now() + 3 * 86400000),
  })
  const [budgetINR, setBudgetINR] = useState(12000)
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Budget')
  const [pace, setPace] = useState<TravelPace>('Moderate')
  const [dietary, setDietary] = useState<DietaryPreference>('No restrictions')
  const [vibes, setVibes] = useState<VibeTag[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const displayError = validationError ?? externalError ?? null

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    if (!range) return
    setDateRange(range)
    if (range.from) setStartDate(range.from.toISOString().split('T')[0])
    if (range.to) setEndDate(range.to.toISOString().split('T')[0])
  }, [])

  const toggleVibe = useCallback((vibe: VibeTag) => {
    setVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    )
  }, [])

  const handleSubmit = useCallback(() => {
    if (!destination.trim()) {
      setValidationError('Where are you headed?')
      return
    }
    if (!startDate || !endDate) {
      setValidationError('Pick your travel dates')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setValidationError('End date must be after start date')
      return
    }
    setValidationError(null)
    onGenerate({
      destination: destination.trim(),
      startDate,
      endDate,
      budgetTier,
      budgetINR,
      pace,
      dietary,
      groupComposition: 'Solo',
      groupSize: 1,
      vibes,
      freeformPrompt: freeformPrompt.trim(),
    })
  }, [destination, startDate, endDate, budgetTier, budgetINR, pace, dietary, vibes, freeformPrompt, onGenerate])

  const destinationHasError = !!displayError && !destination.trim()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-2xl"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Backpack className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Roamly · Solo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-3 leading-tight">
            Pack light.{' '}
            <span className="gemini-gradient-text">Go far.</span>
          </h1>
          <p className="text-zinc-500 text-base">
            AI-planned solo backpacking trips — adaptive, affordable, spontaneous
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 mb-4 space-y-5">

          {/* Destination */}
          <div>
            <label htmlFor="tc-destination" className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">
              Destination
            </label>
            <input
              id="tc-destination"
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Bangkok, Tbilisi, Medellín..."
              className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-invalid={destinationHasError}
              aria-describedby={displayError ? 'tc-error' : undefined}
            />
          </div>

          {/* Dates */}
          <div role="group" aria-label="Travel dates">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
              <p className="text-xs text-zinc-500 uppercase tracking-wide" id="tc-dates-label">Travel Dates</p>
            </div>

            {/* Screen-reader labels for start/end date values */}
            <span id="tc-start-date-label" className="sr-only">Start date</span>
            <span id="tc-end-date-label" className="sr-only">End date</span>

            {/* Date summary chips */}
            <div className="flex gap-3 mb-3">
              <div
                className="flex-1 glass-input rounded-lg px-3 py-2"
                aria-labelledby="tc-start-date-label"
                role="status"
              >
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">Leaving</p>
                <p className="text-sm text-zinc-200 font-medium">{fmt(dateRange.from)}</p>
              </div>
              <div className="flex items-center text-zinc-700" aria-hidden="true">→</div>
              <div
                className="flex-1 glass-input rounded-lg px-3 py-2"
                aria-labelledby="tc-end-date-label"
                role="status"
              >
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">Back by</p>
                <p className="text-sm text-zinc-200 font-medium">{fmt(dateRange.to)}</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl px-3 py-3">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleRangeSelect}
                disabled={{ before: todayDate }}
                classNames={calendarClassNames}
                navLayout="around"
                showOutsideDays
              />
            </div>
          </div>

          {/* Budget */}
          <div role="group" aria-label="Budget Style">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2" aria-hidden="true">Budget Style</p>
            <div className="flex gap-2">
              {BUDGET_CHIPS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setBudgetTier(c.value); setBudgetINR(c.inr) }}
                  aria-pressed={budgetTier === c.value}
                  className={`${budgetTier === c.value ? 'chip-active' : 'chip-inactive'} focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                >
                  {c.label} <span className="opacity-60 text-xs ml-1">{c.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div role="group" aria-label="Travel Pace">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2" aria-hidden="true">Travel Pace</p>
            <div className="flex gap-2">
              {PACE_CHIPS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setPace(c.value)}
                  aria-pressed={pace === c.value}
                  className={`${pace === c.value ? 'chip-active' : 'chip-inactive'} focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div role="group" aria-label="Food Preferences">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2" aria-hidden="true">Food Preferences</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_CHIPS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setDietary(c.value)}
                  aria-pressed={dietary === c.value}
                  className={`${dietary === c.value ? 'chip-active' : 'chip-inactive'} focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vibes */}
          <div role="group" aria-label="Trip Vibes">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2" aria-hidden="true">Trip Vibes</p>
            <div className="flex flex-wrap gap-2">
              {VIBE_CHIPS.map(c => (
                <button
                  key={c.value}
                  onClick={() => toggleVibe(c.value)}
                  aria-pressed={vibes.includes(c.value)}
                  className={`${vibes.includes(c.value) ? 'chip-vibe-active' : 'chip-inactive'} focus:ring-2 focus:ring-blue-400 focus:outline-none`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Freeform */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-1 mb-4">
          <label htmlFor="tc-freeform" className="sr-only">Anything else on your mind?</label>
          <textarea
            id="tc-freeform"
            value={freeformPrompt}
            onChange={e => setFreeformPrompt(e.target.value)}
            placeholder={placeholderRef.current}
            rows={3}
            className="glass-input w-full rounded-xl px-4 py-3 text-base resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </motion.div>

        {displayError && (
          <motion.p
            id="tc-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 text-center mb-3"
            role="alert"
          >
            {displayError}
          </motion.p>
        )}

        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isGenerating}
            className="gemini-gradient-border w-full py-4 rounded-2xl bg-zinc-900 text-zinc-100 font-semibold text-base flex items-center justify-center gap-2 hover:bg-zinc-800/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-busy={isGenerating}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {isGenerating ? 'Planning your escape...' : 'Plan My Solo Trip'}
          </motion.button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-xs text-zinc-600 mt-4">
          Powered by Google Gemini
        </motion.p>
      </motion.div>
    </div>
  )
}
