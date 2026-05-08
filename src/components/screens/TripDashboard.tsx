import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AdaptiveTrip, GeminiActivity } from '../../types/trip'
import { SummaryBar } from '../ui/SummaryBar'
import { CenterTimeline } from '../panels/CenterTimeline'
import { GeminiActivityFeed } from '../panels/GeminiActivityFeed'
import { LeftControlPanel } from '../panels/LeftControlPanel'

interface TripDashboardProps {
  trip: AdaptiveTrip
  geminiActivities: GeminiActivity[]
  isAdapting: boolean
  savedTripId: string | null
  onDisruption: (description: string, id: string) => void
  onReset: () => void
}

export const TripDashboard = memo(function TripDashboard({
  trip,
  geminiActivities,
  isAdapting,
  savedTripId,
  onDisruption,
  onReset,
}: TripDashboardProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SummaryBar summary={trip.summary} destination={trip.destination} savedTripId={savedTripId} />

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.45 } }}
          className="w-64 xl:w-72 flex-shrink-0 border-r border-zinc-800/60 overflow-hidden"
        >
          <LeftControlPanel
            trip={trip}
            onDisruption={onDisruption}
            onReset={onReset}
            isAdapting={isAdapting}
          />
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.12 } }}
          className="flex-1 overflow-hidden"
        >
          <CenterTimeline trip={trip} isAdapting={isAdapting} />
        </motion.main>

        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.45, delay: 0.22 } }}
          className="w-64 xl:w-72 flex-shrink-0 border-l border-zinc-800/60 overflow-hidden glass"
        >
          <GeminiActivityFeed activities={geminiActivities} isAdapting={isAdapting} />
        </motion.aside>
      </div>

      <AnimatePresence>
        {isAdapting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
})
