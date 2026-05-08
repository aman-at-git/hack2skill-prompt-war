export function formatTripDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options)
}
