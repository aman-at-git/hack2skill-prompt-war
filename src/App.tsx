import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGemini } from './hooks/useGemini'
import { TripCreation } from './components/screens/TripCreation'
import { LandingPage } from './components/screens/LandingPage'

const GenerationScreen = lazy(() =>
  import('./components/screens/GenerationScreen').then(m => ({ default: m.GenerationScreen }))
)
const TripDashboard = lazy(() =>
  import('./components/screens/TripDashboard').then(m => ({ default: m.TripDashboard }))
)

export default function App() {
  const [showLanding, setShowLanding] = useState(true)
  const {
    trip,
    appScreen,
    error,
    streamingStatus,
    geminiActivities,
    savedTripId,
    generateItinerary,
    replanItinerary,
    resetToCreation,
  } = useGemini()

  const isAdapting = appScreen === 'disruption-adapting'
  const showDashboard = appScreen === 'dashboard' || isAdapting

  if (showLanding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)', transition: { duration: 0.5 } }}
        >
          <LandingPage onEnter={() => setShowLanding(false)} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'rgb(14 14 14)' }}>
      <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        {appScreen === 'creation' && (
          <motion.main
            key="creation"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } }}
            exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(4px)', transition: { duration: 0.25 } }}
          >
            <TripCreation
              onGenerate={generateItinerary}
              isGenerating={false}
              externalError={error}
            />
          </motion.main>
        )}

        {appScreen === 'generating' && (
          <motion.main
            key="generating"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } }}
            exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(4px)', transition: { duration: 0.25 } }}
          >
            <GenerationScreen
              destination={streamingStatus.length > 0
                ? streamingStatus[0].replace('Analyzing ', '').replace(' travel data...', '')
                : ''}
              streamingStatus={streamingStatus}
            />
          </motion.main>
        )}

        {showDashboard && trip && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="h-screen overflow-hidden"
          >
            <TripDashboard
              trip={trip}
              geminiActivities={geminiActivities}
              isAdapting={isAdapting}
              savedTripId={savedTripId}
              onDisruption={replanItinerary}
              onReset={resetToCreation}
            />
          </motion.main>
        )}
      </AnimatePresence>
      </Suspense>
    </div>
  )
}
