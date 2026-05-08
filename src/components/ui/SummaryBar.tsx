import { memo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CloudSun, Footprints, Zap, Brain } from 'lucide-react'
import type { TripSummary } from '../../types/trip'

interface SummaryBarProps {
  summary: TripSummary
  destination: string
}

const WALKING_LABELS = { low: 'Easy', medium: 'Moderate', high: 'Active' }
const WALKING_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-[-90deg]">
      <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <motion.circle
        cx="22" cy="22" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

export const SummaryBar = memo(function SummaryBar({ summary, destination }: SummaryBarProps) {
  const spentPercent = summary.totalBudget > 0
    ? Math.min(100, Math.round((summary.spentBudget / summary.totalBudget) * 100))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass border-b border-zinc-800 px-6 py-3"
    >
      <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-thin">
        <div className="flex-shrink-0">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Destination</p>
          <p className="text-sm font-semibold gemini-gradient-text">{destination}</p>
        </div>

        <div className="w-px h-8 bg-zinc-800 flex-shrink-0" />

        <div className="flex items-center gap-3 flex-shrink-0">
          <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Budget</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">
                ₹{summary.spentBudget.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-zinc-500">
                / ₹{summary.totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${spentPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-zinc-800 flex-shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <CloudSun className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Weather</p>
            <p className="text-sm text-zinc-300 truncate max-w-[200px]" title={summary.weatherOverview}>{summary.weatherOverview}</p>
          </div>
        </div>

        <div className="w-px h-8 bg-zinc-800 flex-shrink-0" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Footprints className={`w-4 h-4 flex-shrink-0 ${WALKING_COLORS[summary.walkingIntensity]}`} />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Walking</p>
            <p className={`text-sm font-medium ${WALKING_COLORS[summary.walkingIntensity]}`}>
              {WALKING_LABELS[summary.walkingIntensity]}
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-zinc-800 flex-shrink-0" />

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <ScoreRing score={summary.travelEfficiencyScore} color="#63b3ed" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Efficiency</p>
            <motion.p
              className="text-sm font-semibold text-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {summary.travelEfficiencyScore}%
            </motion.p>
          </div>
        </div>

        <div className="w-px h-8 bg-zinc-800 flex-shrink-0" />

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <ScoreRing score={summary.geminiConfidenceScore} color="#a78bfa" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-3 h-3 text-violet-400" />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Confidence</p>
            <motion.p
              className="text-sm font-semibold text-violet-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {summary.geminiConfidenceScore}%
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  )
})
