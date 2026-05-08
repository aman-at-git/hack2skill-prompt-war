import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'

interface LandingPageProps {
  onEnter: () => void
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/landing.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Layered dark overlay — heavier at top and bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10">

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-2"
        >
          <MapPin className="h-5 w-5 text-blue-400" strokeWidth={2} />
          <span className="text-sm font-semibold tracking-widest text-zinc-300 uppercase">
            Roamly
          </span>
        </motion.div>

        {/* Centre hero copy */}
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Travel smarter.
            <br />
            <span className="text-gradient-blue">Plan in seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            className="mt-5 max-w-md text-base text-zinc-300 sm:text-lg"
          >
            Tell Roamly where you want to go. It builds your entire itinerary — day by day, meal by meal — powered by AI.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            className="mt-10 flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-2xl transition-shadow hover:shadow-white/20"
          >
            Plan my trip
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xs text-zinc-500"
        >
          No sign-up required · Powered by Gemini AI
        </motion.p>
      </div>
    </div>
  )
}
