import { describe, expect, it } from 'vitest'
import {
  formatConversationDateDivider,
  formatConversationMessageTime,
  formatConversationTimestamp,
} from './time'

describe('messaging India time helpers', () => {
  it('uses India day boundaries for yesterday labels', () => {
    expect(formatConversationTimestamp('2026-04-15T18:20:00.000Z', '2026-04-15T20:00:00.000Z')).toBe('Yesterday')
  })

  it('formats message timestamps and date dividers in India time', () => {
    expect(formatConversationMessageTime('2026-04-15T20:00:00.000Z')).toMatch(/01:30\s*am/i)
    expect(formatConversationDateDivider('2026-04-15T20:00:00.000Z')).toMatch(/16\s*Apr|Apr\s*16/i)
  })
})