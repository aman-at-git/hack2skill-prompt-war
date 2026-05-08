import { memo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Cloud, Sparkles } from 'lucide-react'
import type { ItineraryTimeSlot } from '../../types/trip'
import { TIME_PERIOD_ICONS, TIME_PERIOD_LABELS } from '../../types/trip'

interface TimelineCardProps {
  slot: ItineraryTimeSlot
  dayDate: string
  isAdapting: boolean
}

export const TimelineCard = memo(function TimelineCard({ slot, isAdapting }: TimelineCardProps) {
  return (
    <motion.div
      layout
      layoutId={`slot-${slot.period}-${slot.location}`}
      initial={{ opacity: 0, y: 16 }}
      animate={
        slot.revised && isAdapting
          ? {
              opacity: 1,
              y: 0,
              borderColor: ['rgba(255,255,255,0.06)', '#f59e0b', '#fcd34d', '#f59e0b', 'rgba(255,255,255,0.06)'],
              boxShadow: [
                '0 0 0 0 transparent',
                '0 0 20px 4px rgba(245,158,11,0.3)',
                '0 0 24px 6px rgba(245,158,11,0.2)',
                '0 0 20px 4px rgba(245,158,11,0.3)',
                '0 0 0 0 transparent',
              ],
            }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: slot.revised ? 1.5 : 0.3, layout: { duration: 0.4 } }}
      className="glass rounded-xl p-4 glass-hover"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">
          {TIME_PERIOD_ICONS[slot.period]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              {TIME_PERIOD_LABELS[slot.period]}
            </span>
            {slot.revised && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30"
              >
                Revised
              </motion.span>
            )}
          </div>

          <div className="flex items-start gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-semibold text-zinc-100 leading-snug">{slot.location}</span>
          </div>

          <p className="text-sm text-zinc-300 mb-3 leading-relaxed">{slot.activity}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-xs text-zinc-500">
            {slot.travelDuration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {slot.travelDuration}
              </span>
            )}
            {slot.weather && (
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                {slot.weather}
              </span>
            )}
            <span className="text-emerald-400 font-medium">
              ₹{slot.estimatedCostINR.toLocaleString('en-IN')}
            </span>
          </div>

          {slot.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {slot.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {slot.geminiReasoning && (
            <div className="flex items-start gap-1.5 pt-2 border-t border-zinc-800">
              <Sparkles className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-zinc-500 italic leading-relaxed">{slot.geminiReasoning}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})
