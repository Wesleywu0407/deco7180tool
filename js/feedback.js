// ═══════════════════════════════════════════════════════════════════════════
//  Adjust — In-app feedback system
//  • Micro-feedback toast  (bottom-right, 280px, auto-dismiss 12 s)
//  • Post-task rating modal (5-star, 4 dimensions)
//  • Reflection modal       (shown after saving a lesson plan)
//  • Floating "Share feedback" button (bottom-left, injected on every page)
// ═══════════════════════════════════════════════════════════════════════════

;(function () {
  'use strict'

  // ── Inject keyframe animation ─────────────────────────────────────────────
  const _style = document.createElement('style')
  _style.textContent = `
    @keyframes adjToastIn {
      from { opacity:0; transform:translateY(14px) scale(.96) }
      to   { opacity:1; transform:translateY(0)    scale(1)   }
    }
    @keyframes adjFadeIn {
      from { opacity:0 } to { opacity:1 }
    }
    .adj-toast-opt:hover {
      background:#f0fdf9 !important;
      border-color:#1D9E75 !important;
      color:#065F46 !important;
    }
    .adj-radio-label:has(input:checked) {
      border-color:#1D9E75 !important;
      background:#f0fdf9 !important;
    }
  `
  document.head.appendChild(_style)

  // ── Toast state ───────────────────────────────────────────────────────────
  let _toastTimer   = null
  let _currentToast = null

  // ── Rating modal state ────────────────────────────────────────────────────
  let _stars = { clarity: 0, usefulness: 0, confidence: 0, trust: 0 }

  // ─────────────────────────────────────────────────────────────────────────
  //  1. MICRO-FEEDBACK TOAST
  // ─────────────────────────────────────────────────────────────────────────
  function showMicroFeedback({ question, options, context }) {
    dismissToast()

    const toast = document.createElement('div')
    toast.id = 'adj-toast'
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9995',
      width: '280px', background: 'white', borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(15,23,42,.18),0 2px 8px rgba(15,23,42,.07)',
      border: '1px solid #E5E7EB', padding: '16px',
      animation: 'adjToastIn .25s ease', fontFamily: 'inherit',
    })

    toast.innerHTML = `
      <button id="adj-toast-x"
        style="position:absolute;top:8px;right:10px;background:none;border:none;
               cursor:pointer;color:#9CA3AF;font-size:18px;line-height:1;padding:2px 5px">
        &times;
      </button>
      <p style="font-size:13px;font-weight:600;color:#111827;line-height:1.45;
                margin-bottom:10px;padding-right:18px">${question}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${options.map(o => `
          <button class="adj-toast-opt"
            style="padding:5px 11px;border-radius:999px;border:1px solid #E5E7EB;
                   background:white;font-size:11px;font-weight:500;color:#374151;
                   cursor:pointer;transition:all .15s;font-family:inherit"
            data-val="${o}">${o}
          </button>
        `).join('')}
      </div>
      <p style="font-size:10px;color:#9CA3AF;margin:0">This helps us improve Adjust</p>
    `

    document.body.appendChild(toast)
    _currentToast = toast

    toast.querySelectorAll('.adj-toast-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.trackEvent) {
          trackEvent('micro_feedback', {
            question, response: btn.dataset.val, context,
          })
        }
        dismissToast()
      })
    })
    document.getElementById('adj-toast-x').addEventListener('click', dismissToast)
    _toastTimer = setTimeout(dismissToast, 12000)
  }

  function dismissToast() {
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null }
    if (_currentToast) { _currentToast.remove(); _currentToast = null }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  2. POST-TASK RATING MODAL (floating button triggers this)
  // ─────────────────────────────────────────────────────────────────────────
  const DIMS = [
    { key: 'clarity',    label: 'How clear was the information presented?',            sub: 'Clarity' },
    { key: 'usefulness', label: 'How useful were the adjustment suggestions?',          sub: 'Usefulness' },
    { key: 'confidence', label: 'How confident did you feel planning for SEN students?',sub: 'Confidence' },
    { key: 'trust',      label: 'How much did you trust the suggestions provided?',     sub: 'Trust' },
  ]

  function showRatingModal() {
    if (document.getElementById('adj-rating-modal')) return
    _stars = { clarity: 0, usefulness: 0, confidence: 0, trust: 0 }

    const overlay = _makeOverlay('adj-rating-modal')
    overlay.innerHTML = `
      <div style="background:white;border-radius:20px;max-width:520px;width:100%;
                  box-shadow:0 24px 64px rgba(15,23,42,.22);overflow:hidden;
                  animation:adjFadeIn .2s ease">
        <div style="padding:24px 24px 16px;border-bottom:1px solid #F3F4F6">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
            <div>
              <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 5px">
                Rate your experience
              </h2>
              <p style="font-size:13px;color:#6B7280;margin:0;line-height:1.5">
                Your answers help us understand how Adjust supports inclusive teaching.
              </p>
            </div>
            <button id="adj-rm-close"
              style="background:none;border:none;cursor:pointer;color:#9CA3AF;
                     font-size:22px;line-height:1;padding:0;flex-shrink:0;margin-top:-2px">
              &times;
            </button>
          </div>
        </div>

        <div style="padding:20px 24px;max-height:55vh;overflow-y:auto">
          <div id="adj-dim-rows" style="display:flex;flex-direction:column;gap:16px"></div>
          <div style="margin-top:18px">
            <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:6px">
              Any other thoughts? <span style="font-weight:400;color:#9CA3AF">(optional)</span>
            </label>
            <textarea id="adj-rm-comment"
              placeholder="What worked well? What was confusing?"
              style="width:100%;border:1px solid #E5E7EB;border-radius:10px;
                     padding:10px 12px;font-size:13px;color:#374151;resize:vertical;
                     min-height:80px;font-family:inherit;outline:none;box-sizing:border-box">
            </textarea>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #F3F4F6;
                    display:flex;align-items:center;justify-content:space-between">
          <span id="adj-rm-status" style="font-size:12px;color:#9CA3AF"></span>
          <div style="display:flex;gap:10px">
            <button id="adj-rm-cancel"
              style="padding:8px 18px;border:1px solid #E5E7EB;border-radius:8px;
                     background:white;font-size:13px;font-weight:500;color:#374151;
                     cursor:pointer;font-family:inherit">Cancel
            </button>
            <button id="adj-rm-submit"
              style="padding:8px 18px;border:none;border-radius:8px;background:#1D9E75;
                     font-size:13px;font-weight:600;color:white;cursor:pointer;
                     font-family:inherit">Submit feedback
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    // Render star rows
    const container = document.getElementById('adj-dim-rows')
    DIMS.forEach(({ key, label, sub }) => {
      const row = document.createElement('div')
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px'
      row.innerHTML = `
        <div style="min-width:0">
          <p style="font-size:13px;font-weight:500;color:#111827;margin:0 0 2px">${label}</p>
          <p style="font-size:11px;color:#9CA3AF;margin:0">${sub}</p>
        </div>
        <div class="adj-star-row" data-dim="${key}"
             style="display:flex;gap:3px;flex-shrink:0">
          ${[1,2,3,4,5].map(n => `
            <button class="adj-star" data-dim="${key}" data-val="${n}"
              style="background:none;border:none;cursor:pointer;font-size:24px;
                     color:#E5E7EB;padding:0;line-height:1;transition:color .1s;
                     font-family:inherit">★
            </button>
          `).join('')}
        </div>
      `
      container.appendChild(row)
    })

    // Star interactions
    document.querySelectorAll('.adj-star').forEach(s => {
      s.addEventListener('click',       () => { _stars[s.dataset.dim] = +s.dataset.val; _renderStars(s.dataset.dim) })
      s.addEventListener('mouseenter',  () => _hoverStars(s.dataset.dim, +s.dataset.val))
    })
    document.querySelectorAll('.adj-star-row').forEach(row => {
      row.addEventListener('mouseleave', () => _renderStars(row.dataset.dim))
    })

    document.getElementById('adj-rm-close') .addEventListener('click', _closeRatingModal)
    document.getElementById('adj-rm-cancel').addEventListener('click', _closeRatingModal)
    document.getElementById('adj-rm-submit').addEventListener('click', _submitRating)
    overlay.addEventListener('click', e => { if (e.target === overlay) _closeRatingModal() })
  }

  function _hoverStars(dim, upTo) {
    document.querySelectorAll(`.adj-star[data-dim="${dim}"]`).forEach(s => {
      s.style.color = +s.dataset.val <= upTo ? '#F59E0B' : '#E5E7EB'
    })
  }
  function _renderStars(dim) {
    const selected = _stars[dim]
    document.querySelectorAll(`.adj-star[data-dim="${dim}"]`).forEach(s => {
      s.style.color = +s.dataset.val <= selected ? '#1D9E75' : '#E5E7EB'
    })
  }
  function _closeRatingModal() {
    const el = document.getElementById('adj-rating-modal')
    if (el) el.remove()
  }
  function _submitRating() {
    const comment = document.getElementById('adj-rm-comment')?.value?.trim() || ''
    if (window.trackEvent) {
      trackEvent('post_task_rating', {
        clarity:    _stars.clarity,
        usefulness: _stars.usefulness,
        confidence: _stars.confidence,
        trust:      _stars.trust,
        comment,
      })
    }
    const status = document.getElementById('adj-rm-status')
    if (status) { status.textContent = '✓ Thank you!'; status.style.color = '#1D9E75' }
    setTimeout(_closeRatingModal, 1100)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  3. REFLECTION MODAL  (call from planner.js after save)
  // ─────────────────────────────────────────────────────────────────────────
  function showReflectionModal(lessonId, { onDone } = {}) {
    if (document.getElementById('adj-refl-modal')) return

    const overlay = _makeOverlay('adj-refl-modal')
    overlay.innerHTML = `
      <div style="background:white;border-radius:20px;max-width:520px;width:100%;
                  box-shadow:0 24px 64px rgba(15,23,42,.22);
                  animation:adjFadeIn .2s ease">

        <div style="padding:22px 24px 16px;border-bottom:1px solid #F3F4F6">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <div style="width:34px;height:34px;border-radius:50%;background:#e6f7f2;
                        display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="16" height="16" fill="none" stroke="#1D9E75" stroke-width="2"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3
                     m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547
                     A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531
                     c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h2 style="font-size:16px;font-weight:700;color:#111827;margin:0">
              Before you go — a quick reflection
            </h2>
          </div>
          <p style="font-size:13px;color:#6B7280;margin:0">
            Help us understand how Adjust fits into your planning process.
          </p>
        </div>

        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:20px">

          <!-- Q1: radio -->
          <div>
            <p style="font-size:13px;font-weight:600;color:#111827;margin:0 0 10px">
              Did Adjust help you consider students you might have otherwise overlooked?
            </p>
            <div id="refl-q1-opts" style="display:flex;flex-direction:column;gap:6px">
              ${['Yes, definitely','Somewhat','Not really','I would have remembered anyway'].map(o => `
                <label class="adj-radio-label"
                  style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:9px 12px;
                         border:1px solid #E5E7EB;border-radius:8px;transition:all .15s">
                  <input type="radio" name="refl-q1" value="${o}"
                    style="accent-color:#1D9E75;width:14px;height:14px;flex-shrink:0" />
                  <span style="font-size:13px;color:#374151">${o}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Q2: textarea -->
          <div>
            <p style="font-size:13px;font-weight:600;color:#111827;margin:0 0 8px">
              Without Adjust, how would you have planned for these students?
            </p>
            <textarea id="refl-q2"
              placeholder="e.g. I would have checked my notes, spoken to the learning support team..."
              style="width:100%;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;
                     font-size:13px;color:#374151;resize:vertical;min-height:80px;
                     font-family:inherit;outline:none;box-sizing:border-box">
            </textarea>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #F3F4F6;
                    display:flex;align-items:center;justify-content:space-between">
          <button id="refl-skip"
            style="background:none;border:none;font-size:13px;color:#9CA3AF;
                   cursor:pointer;text-decoration:underline;font-family:inherit">
            Skip for now
          </button>
          <button id="refl-submit"
            style="padding:9px 22px;border:none;border-radius:8px;background:#1D9E75;
                   font-size:13px;font-weight:600;color:white;cursor:pointer;
                   font-family:inherit">
            Save reflection
          </button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    const _close = () => { overlay.remove(); if (typeof onDone === 'function') onDone() }

    document.getElementById('refl-skip').addEventListener('click', _close)
    document.getElementById('refl-submit').addEventListener('click', () => {
      const q1 = overlay.querySelector('input[name="refl-q1"]:checked')?.value || ''
      const q2 = document.getElementById('refl-q2')?.value?.trim() || ''
      if (window.trackEvent) {
        trackEvent('reflection', {
          consideredOverlookedStudents: q1,
          planningWithout: q2,
          lessonId,
        })
      }
      _close()
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  4. FLOATING "Share feedback" BUTTON
  // ─────────────────────────────────────────────────────────────────────────
  function _injectFeedbackButton() {
    if (document.getElementById('adj-feedback-btn')) return
    const btn = document.createElement('button')
    btn.id = 'adj-feedback-btn'
    Object.assign(btn.style, {
      position: 'fixed', bottom: '24px', left: '216px', zIndex: '9990',
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 16px', border: 'none', borderRadius: '999px',
      background: '#1D9E75', color: 'white',
      fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(29,158,117,.35)',
      transition: 'all .2s',
    })
    btn.innerHTML = `
      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01
             M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20
             l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      Share feedback
    `
    btn.addEventListener('click', showRatingModal)
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#178a63'
      btn.style.transform  = 'translateY(-1px)'
      btn.style.boxShadow  = '0 6px 20px rgba(29,158,117,.45)'
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#1D9E75'
      btn.style.transform  = ''
      btn.style.boxShadow  = '0 4px 16px rgba(29,158,117,.35)'
    })
    document.body.appendChild(btn)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Utility
  // ─────────────────────────────────────────────────────────────────────────
  function _makeOverlay(id) {
    const el = document.createElement('div')
    el.id = id
    Object.assign(el.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(15,23,42,.42)',
      backdropFilter: 'blur(4px)',
      zIndex: '9997',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'adjFadeIn .2s ease',
    })
    return el
  }

  // ── DOM ready: inject floating button ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _injectFeedbackButton)
  } else {
    _injectFeedbackButton()
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.AdjustFeedback = {
    showMicroFeedback,
    dismissToast,
    showRatingModal,
    showReflectionModal,
  }
}())
