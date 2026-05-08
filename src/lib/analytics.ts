import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

export function trackTripGenerated(destination: string, days: number, budgetTier: string) {
  logEvent(analytics, 'trip_generated', { destination, days, budget_tier: budgetTier })
}

export function trackDisruptionApplied(disruptionId: string) {
  logEvent(analytics, 'disruption_applied', { disruption_type: disruptionId })
}

export function trackTripReset() {
  logEvent(analytics, 'trip_reset')
}

export function trackCalendarExport(destination: string, days: number) {
  logEvent(analytics, 'calendar_export', { destination, days })
}

export function trackTripSaved(tripId: string, destination: string) {
  logEvent(analytics, 'trip_saved', { trip_id: tripId, destination })
}
