import { useState, memo } from 'react'
import type { ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudRain, Store, PlaneTakeoff, TrendingDown, UserPlus, Users,
  Zap, ChevronDown,
} from 'lucide-react'
import { DISRUPTION_PRESETS } from '../../types/trip'

const ICON_MAP: Record<string, ElementType> = {
  CloudRain,
  Store,
  PlaneTakeoff,
  TrendingDown,
  UserPlus,
  Users,
}

interface DisruptionSimulatorProps {
  onDisruption: (description: string, id: string) => void
  isAdapting: boolean
}

export const DisruptionSimulator = memo(function DisruptionSimulator({
  onDisruption,
  isAdapting,
}: DisruptionSimulatorProps) {
  const [expanded, setExpanded] = useState(false)
  const [customText, setCustomText] = useState('')

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors focus:ring-2 focus:ring-inset focus:ring-blue-400 focus:outline-none"
        disabled={isAdapting}
        aria-expanded={expanded}
        aria-controls="disruption-panel"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span className="text-sm font-medium text-zinc-200">Simulate Disruption</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            id="disruption-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-zinc-800/60 pt-3">
              <p className="text-xs text-zinc-500 mb-3">
                Trigger a realtime event to see Gemini adapt your trip live.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {DISRUPTION_PRESETS.map(preset => {
                  const Icon = ICON_MAP[preset.icon] ?? Zap
                  return (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onDisruption(preset.description, preset.id)
                        setExpanded(false)
                      }}
                      disabled={isAdapting}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-zinc-300">{preset.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="pt-2">
                <label htmlFor="custom-disruption" className="sr-only">
                  Describe a custom disruption
                </label>
                <textarea
                  id="custom-disruption"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="Or describe a custom disruption..."
                  disabled={isAdapting}
                  rows={2}
                  className="glass-input w-full rounded-lg px-3 py-2 text-xs resize-none disabled:opacity-40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (customText.trim()) {
                      onDisruption(customText.trim(), 'custom')
                      setCustomText('')
                      setExpanded(false)
                    }
                  }}
                  disabled={isAdapting || !customText.trim()}
                  aria-label="Apply custom disruption and replan trip"
                  className="mt-2 w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  {isAdapting ? 'Adapting...' : 'Apply Custom Disruption'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
