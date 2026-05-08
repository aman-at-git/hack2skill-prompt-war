import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface GenerationScreenProps {
  destination: string
  streamingStatus: string[]
}

export const GenerationScreen = memo(function GenerationScreen({
  destination,
  streamingStatus,
}: GenerationScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      aria-busy="true"
      aria-label="Generating your itinerary"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="flex justify-center mb-10" aria-hidden="true">
          <div className="relative w-28 h-28">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                background: 'linear-gradient(135deg, rgba(66,133,244,0.15), transparent) border-box',
                borderColor: 'rgba(66,133,244,0.3)',
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 rounded-full"
              style={{ border: '1.5px solid rgba(156, 39, 176, 0.25)' }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-6 rounded-full"
              style={{ border: '1px solid rgba(99, 179, 237, 0.2)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(66,133,244,0.4) 0%, rgba(156,39,176,0.2) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-semibold text-zinc-100 mb-1">
            Planning{destination ? ` ${destination}` : ' your trip'}
          </h2>
          <p className="text-sm text-zinc-500">Gemini is orchestrating your adaptive itinerary</p>
        </motion.div>

        <div className="glass rounded-2xl p-5 font-mono text-sm space-y-0 min-h-[240px]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800" aria-hidden="true">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-amber-500/70" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
            <span className="text-xs text-zinc-600 ml-2">gemini-planner</span>
          </div>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Planning progress"
          >
            <AnimatePresence initial={false}>
              {streamingStatus.map((msg, i) => {
                const isLatest = i === streamingStatus.length - 1
                return (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: isLatest ? 1 : 0.45, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 py-1.5"
                  >
                    <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                      {isLatest ? (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-blue-400 mt-1"
                        />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className={isLatest ? 'text-zinc-200' : 'text-zinc-500'}>
                      {msg}
                      {isLatest && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-0.5 h-3.5 bg-blue-400 ml-1 align-middle"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {streamingStatus.length === 0 && (
              <div className="flex items-center gap-3 py-1.5">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-blue-400 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-zinc-400">
                  Initializing Gemini...
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-0.5 h-3.5 bg-blue-400 ml-1 align-middle"
                    aria-hidden="true"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
})
