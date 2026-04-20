// ═══════════════════════════════════════════════════════════════════════════
//  Adjust — Analytics / interaction tracking
//  Stores events to localStorage under key "adjust_events".
//  All pages import this file; it auto-fires a page_visited event on load.
// ═══════════════════════════════════════════════════════════════════════════

;(function () {
  'use strict'

  const STORAGE_KEY = 'adjust_events'

  // ── Core: save one event ──────────────────────────────────────────────────
  function trackEvent(eventName, data) {
    try {
      const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const entry = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        event: eventName,
        timestamp: new Date().toISOString(),
        ...data,
      }
      events.push(entry)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      return entry
    } catch (e) {
      console.warn('[Adjust Analytics] Could not save event:', e)
    }
  }

  // ── Read / clear ──────────────────────────────────────────────────────────
  function getEvents() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
    catch { return [] }
  }

  function clearEvents() {
    localStorage.removeItem(STORAGE_KEY)
  }

  // ── Auto: page_visited ────────────────────────────────────────────────────
  const pageId = location.pathname.split('/').pop().replace('.html', '') || 'index'
  trackEvent('page_visited', { pageId })

  // ── Public API ────────────────────────────────────────────────────────────
  window.trackEvent      = trackEvent   // shorthand used everywhere
  window.AdjustAnalytics = { trackEvent, getEvents, clearEvents }
}())
