import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2)}`,
})
