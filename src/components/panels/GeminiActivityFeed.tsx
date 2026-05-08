import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, Brain, Calculator, Activity } from 'lucide-react'
import type { ElementType } from 'react'
import type { GeminiActivity, GeminiActivityType } from '../../types/trip'

const TYPE_CONFIG: Record<GeminiActivityType, { icon: ElementType; color: string; bg: string }> = {
  optimization: { icon: TrendingUp,     color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  alert:        { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  decision:     { icon: Brain,          color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  calculation:  { icon: Calculator,     color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface GeminiActivityFeedProps {
  activities: GeminiActivity[]
  isAdapting: boolean
}

export const GeminiActivityFeed = memo(function GeminiActivityFeed({
  activities,
  isAdapting,
}: GeminiActivityFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-zinc-200">Gemini Feed</span>
        </div>
        {isAdapting && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-amber-400">Adapting</span>
          </motion.div>
        )}
        {!isAdapting && activities.length > 0 && (
          <span className="text-xs text-zinc-600">{activities.length} events</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Activity className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-600">Gemini activity will appear here</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map(activity => {
              const config = TYPE_CONFIG[activity.type]
              const Icon = config.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2.5 mb-3"
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md ${config.bg} flex items-center justify-center mt-0.5`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 leading-relaxed">{activity.message}</p>
                    <p className="text-xs text-zinc-600 mt-0.5 font-mono">{formatTime(activity.timestamp)}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
})
