import type { AdaptiveTrip } from '../types/trip'

function toCalendarDate(dateStr: string, offsetHours: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setHours(d.getHours() + offsetHours)
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
}

function buildDayDetails(slots: AdaptiveTrip['days'][number]['slots']): string {
  return slots
    .map(s => `${s.period.charAt(0).toUpperCase() + s.period.slice(1)}: ${s.activity} @ ${s.location}`)
    .join('\n')
}

export function buildCalendarUrl(trip: AdaptiveTrip, dayIndex: number): string {
  const day = trip.days[dayIndex]
  if (!day) return '#'

  const title = encodeURIComponent(`Roamly: ${trip.destination} – Day ${day.day}`)
  const details = encodeURIComponent(buildDayDetails(day.slots))
  const location = encodeURIComponent(trip.destination)
  const start = toCalendarDate(day.date, 8)
  const end = toCalendarDate(day.date, 22)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
}

export function buildFullTripCalendarUrl(trip: AdaptiveTrip): string {
  // Links to the first day; the user can repeat for subsequent days
  return buildCalendarUrl(trip, 0)
}
