import { memo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Calendar, RotateCcw, Sliders, CalendarPlus } from 'lucide-react'
import type { AdaptiveTrip } from '../../types/trip'
import { DisruptionSimulator } from '../ui/DisruptionSimulator'
import { formatTripDate } from '../../utils/formatDate'
import { buildCalendarUrl } from '../../utils/googleCalendar'
import { trackCalendarExport } from '../../lib/analytics'

interface LeftControlPanelProps {
  trip: AdaptiveTrip
  onDisruption: (description: string, id: string) => void
  onReset: () => void
  isAdapting: boolean
}

const QUICK_MODS = [
  'Reduce budget',
  'Add nightlife',
  'Less walking',
  'Indoor only',
  'Hidden spots',
  'More relaxed',
]

export const LeftControlPanel = memo(function LeftControlPanel({
  trip,
  onDisruption,
  onReset,
  isAdapting,
}: LeftControlPanelProps) {
  const totalDays = trip.days.length
  const firstDate = trip.days[0]?.date
  const lastDate = trip.days[totalDays - 1]?.date

  function handleCalendarExport() {
    trackCalendarExport(trip.destination, totalDays)
    trip.days.forEach((_, i) => {
      const url = buildCalendarUrl(trip, i)
      window.open(url, '_blank', 'noopener,noreferrer')
    })
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-4 py-4 flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="glass rounded-xl p-4 space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-zinc-200">Trip Details</h3>
        </div>

        <dl className="space-y-2">
          <div className="flex items-center justify-between">
            <dt className="text-xs text-zinc-500">Destination</dt>
            <dd className="text-xs font-medium text-zinc-200">{trip.destination}</dd>
          </div>
          {firstDate && lastDate && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" /> Dates
              </dt>
              <dd className="text-xs font-medium text-zinc-200">
                {formatTripDate(firstDate)}
                {' – '}
                {formatTripDate(lastDate)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-xs text-zinc-500 flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" /> Duration
            </dt>
            <dd className="text-xs font-medium text-zinc-200">{totalDays} days</dd>
          </div>
        </dl>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalendarExport}
          disabled={isAdapting}
          className="w-full flex items-center justify-center gap-2 py-2 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs hover:bg-blue-500/20 hover:border-blue-400/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:outline-none"
          aria-label="Export itinerary to Google Calendar"
        >
          <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
          Add to Google Calendar
        </motion.button>
      </motion.div>

      {trip.destination && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="glass rounded-xl overflow-hidden"
        >
          <iframe
            title={`Map of ${trip.destination}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(trip.destination)}&output=embed`}
            className="w-full h-36 border-0 opacity-80"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-violet-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-zinc-200">Quick Modifications</h3>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick trip modifications">
          {QUICK_MODS.map(mod => (
            <motion.button
              key={mod}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onDisruption(`User wants to: ${mod}`, 'custom')}
              disabled={isAdapting}
              className="chip-inactive disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {mod}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <DisruptionSimulator onDisruption={onDisruption} isAdapting={isAdapting} />
      </motion.div>

      <div className="mt-auto">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          disabled={isAdapting}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-zinc-700/50 text-zinc-400 text-sm hover:text-zinc-200 hover:border-zinc-500/50 transition-colors disabled:opacity-40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          New Trip
        </motion.button>
      </div>
    </div>
  )
})
