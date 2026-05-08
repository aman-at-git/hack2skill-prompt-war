export function sanitizeInput(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim()
}

export function sanitizeOutput(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim()
}
