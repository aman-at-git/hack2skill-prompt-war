import { memo } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { AdaptiveTrip } from '../../types/trip'
import { TimelineCard } from '../ui/TimelineCard'

interface CenterTimelineProps {
  trip: AdaptiveTrip
  isAdapting: boolean
}

export const CenterTimeline = memo(function CenterTimeline({ trip, isAdapting }: CenterTimelineProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-4 py-4">
      <LayoutGroup>
        <div className="space-y-8">
          {trip.days.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: dayIndex * 0.07 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-zinc-700/50">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm font-semibold text-zinc-200">Day {day.day}</span>
                  {day.date && (
                    <span className="text-xs text-zinc-500">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/50 to-transparent" />
              </div>

              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-violet-500/20 to-transparent" />

                <div className="space-y-3">
                  {day.slots.map(slot => (
                    <TimelineCard
                      key={`${day.day}-${slot.period}`}
                      slot={slot}
                      dayDate={day.date}
                      isAdapting={isAdapting}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  )
})
