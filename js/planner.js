// ─── Init ─────────────────────────────────────────────────────────────────────
renderSidebar('lessons')

const params      = new URLSearchParams(location.search)
const isNewLesson = params.get('new')  === '1'
const isEditLesson= params.get('edit') === '1'
const lessonId    = params.get('id')

const fallbackLesson = window.AdjustStore.getLessons()[0]
let lesson = isNewLesson
  ? { subject:'Mathematics', year:'Year 5', title:'', date:'Friday',
      session:'Period 1', duration:'60 min', goals:'', assessment:'', studentIds:[] }
  : (window.AdjustStore.getLesson(lessonId) || fallbackLesson)

const currentLessonId = lesson?.id || 'new'
let selectedIds  = [...(lesson.studentIds || [])]
let adjustments  = window.AdjustStore.generateAdjustmentSuggestions(lesson, selectedIds)
let plannerSuccessMessage = ''

// ── UI filter / search state ───────────────────────────────────────────────────
let activeFilter = 'all'   // 'all' | 'materials' | 'participation' | 'assessment' | 'technology'
let rosterSearch = ''
let editingSuggestionId = null
const editedSuggestions = {}

// ── Research / comparison metrics ─────────────────────────────────────────────
const _pageStartTime      = Date.now()
const _initialSelectedIds = [...selectedIds]
let   _selectionChanged   = false

// ── Form state (new / edit modes) ─────────────────────────────────────────────
const lessonFormState = {
  subject:    lesson.subject,
  year:       lesson.year,
  title:      lesson.title,
  date:       lesson.date,
  session:    lesson.session,
  duration:   lesson.duration,
  goals:      lesson.goals,
  assessment: lesson.assessment,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(v) {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function rosterSupportLabel(label) {
  const key = String(label || '').trim().toUpperCase()
  return {
    DYSLEXIA: 'Reading support',
    ASD: 'Sensory support',
    ADHD: 'Attention support',
    PHYSICAL: 'Access support',
    HEARING: 'Hearing support',
    WEBSITE: 'Learning support',
  }[key] || label
}

function syncAdjustments() {
  adjustments = window.AdjustStore.generateAdjustmentSuggestions(
    { ...lesson, ...lessonFormState, subject: lessonFormState.subject.toUpperCase() },
    selectedIds
  )
  applyEditedSuggestions()
}

function applyEditedSuggestions() {
  adjustments.forEach((adj) => {
    if (editedSuggestions[adj.id]) {
      adj.description = editedSuggestions[adj.id]
      adj.editedByTeacher = true
    }
  })
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function updateBreadcrumb() {
  const el = document.getElementById('breadcrumb-lesson')
  if (!el) return
  el.textContent = isNewLesson ? 'New lesson'
    : isEditLesson ? 'Edit lesson'
    : (lesson?.title || 'Lesson planner')
}

// ─── Render: Class Roster ─────────────────────────────────────────────────────
function renderRoster() {
  const students    = window.AdjustStore.getStudents()
  const q           = rosterSearch.toLowerCase().trim()
  const visible     = q ? students.filter(s => s.name.toLowerCase().includes(q)) : students
  const selectedCnt = selectedIds.length

  // Update count label
  const countEl = document.getElementById('roster-count')
  if (countEl) countEl.textContent = `${students.length} students · ${selectedCnt} selected`

  document.getElementById('roster').innerHTML = visible.length === 0
    ? `<p class="text-xs text-gray-400 italic text-center mt-6">No students match "${rosterSearch}"</p>`
    : visible.map(student => {
        const selected  = selectedIds.includes(student.id)
        const needTags  = student.needs.map(n =>
          `<span class="tag" style="background:${n.bg};color:${n.text}">${escapeHtml(rosterSupportLabel(n.label))}</span>`
        ).join('')

        return `
          <div class="roster-card ${selected ? 'selected' : ''}"
               onclick="toggleStudent('${student.id}')">
            <div class="flex items-center gap-3">
              <!-- Avatar (36px) -->
              <div class="avatar flex-shrink-0"
                   style="width:32px;height:32px;min-width:32px;font-size:11px;
                          font-weight:700;background:${student.avatarBg}">
                ${student.initials}
              </div>
              <div class="min-w-0">
                <p class="roster-name" style="font-size:14px;font-weight:500;color:#111827;
                   line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${student.name}
                </p>
                <div class="flex flex-wrap gap-1 mt-1" style="font-size:11px">${needTags}</div>
              </div>
            </div>
          </div>
        `
      }).join('')
}

// ─── Render: Lesson Context (middle column) ───────────────────────────────────
function renderContext() {
  const footer = document.getElementById('lesson-footer')

  // ── NEW / EDIT FORM ──────────────────────────────────────────────────────────
  if (isNewLesson || isEditLesson) {
    if (footer) footer.innerHTML = ''   // hide the fixed footer in form mode

    const adjustingPills = selectedIds.map(id => {
      const s = window.AdjustStore.getStudent(id)
      if (!s) return ''
      return `
        <div class="adjusting-pill">
          <div class="avatar" style="width:18px;height:18px;min-width:18px;font-size:8px;
               font-weight:700;background:${s.avatarBg}">${s.initials}</div>
          <span style="font-size:12px;font-weight:500;color:#059669">${s.name}</span>
        </div>
      `
    }).join('')

    document.getElementById('lesson-context').innerHTML = `
      <div class="px-6 py-5">
        <div class="surface-card p-5 mb-5">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <p class="planner-col-label mb-2">${isEditLesson ? 'Edit lesson' : 'Create lesson'}</p>
              <h2 class="text-base font-semibold text-gray-900">
                ${isEditLesson ? 'Update lesson plan' : 'New lesson plan'}
              </h2>
              <p class="text-[13px] text-gray-500 mt-1 leading-relaxed">
                ${isEditLesson
                  ? 'Update the lesson details, roster, and support plan.'
                  : "Build a lesson, choose the students you are adjusting for, and save it back to this week's plan."}
              </p>
            </div>
          </div>
          ${plannerSuccessMessage
            ? `<div class="status-banner mb-4">${plannerSuccessMessage}</div>` : ''}

          <form id="lesson-edit-form" class="space-y-5">
            <div class="settings-profile-grid">
              <div>
                <label class="field-label" for="lesson-subject">Subject</label>
                <input id="lesson-subject" name="subject" class="input-shell"
                       value="${escapeHtml(lessonFormState.subject)}" />
              </div>
              <div>
                <label class="field-label" for="lesson-year">Year level</label>
                <input id="lesson-year" name="year" class="input-shell"
                       value="${escapeHtml(lessonFormState.year)}" />
              </div>
              <div class="full-span">
                <label class="field-label" for="lesson-title">Lesson title</label>
                <input id="lesson-title" name="title" class="input-shell"
                       value="${escapeHtml(lessonFormState.title)}" />
              </div>
              <div>
                <label class="field-label" for="lesson-date">Date</label>
                <input id="lesson-date" name="date" class="input-shell"
                       value="${escapeHtml(lessonFormState.date)}" />
              </div>
              <div>
                <label class="field-label" for="lesson-session">Session</label>
                <input id="lesson-session" name="session" class="input-shell"
                       value="${escapeHtml(lessonFormState.session)}" />
              </div>
              <div>
                <label class="field-label" for="lesson-duration">Duration</label>
                <input id="lesson-duration" name="duration" class="input-shell"
                       value="${escapeHtml(lessonFormState.duration)}" />
              </div>
              <div class="full-span">
                <label class="field-label" for="lesson-goals">Learning goals</label>
                <textarea id="lesson-goals" name="goals"
                          class="input-shell min-h-[96px]">${escapeHtml(lessonFormState.goals)}</textarea>
              </div>
              <div class="full-span">
                <label class="field-label" for="lesson-assessment">Assessment</label>
                <textarea id="lesson-assessment" name="assessment"
                          class="input-shell min-h-[96px]">${escapeHtml(lessonFormState.assessment)}</textarea>
              </div>
            </div>

            <div>
              <p class="ctx-section-heading">Adjusting for</p>
              <div class="flex flex-wrap gap-2 mt-2" id="adjusting-for">
                ${selectedIds.length === 0
                  ? '<p class="text-[13px] text-gray-400 italic">No students selected — choose from the roster</p>'
                  : adjustingPills}
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <p class="text-[12px] text-gray-400">
                Choose students from the roster to tailor support suggestions for your review.
              </p>
              <div class="flex items-center gap-3">
                <button type="button" class="btn-ghost" id="cancel-new-lesson">Cancel</button>
                <button type="submit" class="btn-solid">
                  ${isEditLesson ? 'Save changes' : 'Save lesson plan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `

    // Wire up form
    const form = document.getElementById('lesson-edit-form')
    form.addEventListener('input', e => {
      const { name, value } = e.target
      lessonFormState[name] = value
      syncAdjustments()
      renderAdjustments()
    })
    form.addEventListener('submit', saveLessonPlan)
    document.getElementById('cancel-new-lesson').addEventListener('click', () => {
      location.href = isEditLesson ? `planner.html?id=${lesson.id}` : 'index.html'
    })
    return
  }

  // ── VIEW MODE ────────────────────────────────────────────────────────────────
  const subjectLabel = (lesson.subject || '').toUpperCase()
  const yearLabel    = (lesson.year || '').toUpperCase()

  // Choose badge colour by subject
  const subjectBadgeStyle = subjectLabel.includes('MATH')
    ? 'background:#DBEAFE;color:#1D4ED8'
    : subjectLabel.includes('ENGLISH')
    ? 'background:#EDE9FE;color:#5B21B6'
    : subjectLabel.includes('SCIENCE')
    ? 'background:#D1FAE5;color:#065F46'
    : 'background:#D1FAE5;color:#065F46'

  // Date / time badges
  const dateText  = lesson.date    || ''
  const sessText  = lesson.session || ''
  const durText   = lesson.duration|| ''

  // Adjusting-for pills
  const adjustingPills = selectedIds.map(id => {
    const s = window.AdjustStore.getStudent(id)
    if (!s) return ''
    return `
      <div class="adjusting-pill">
        <div class="avatar"
             style="width:20px;height:20px;min-width:20px;font-size:8px;
                    font-weight:700;background:${s.avatarBg}">${s.initials}</div>
        <span style="font-size:12px;font-weight:500;color:#059669">${s.name}</span>
      </div>
    `
  }).join('')

  // Render the lesson info header + scrollable sections
  document.getElementById('lesson-context').innerHTML = `
    <!-- Lesson info block: light blue-grey bg -->
    <div class="lesson-info-header">
      <!-- Subject + Year badges -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="lesson-subject-badge" style="${subjectBadgeStyle}">${subjectLabel}</span>
        <span style="font-size:11px;color:#9CA3AF;font-weight:500">${yearLabel}</span>
      </div>

      <!-- Title (20px) -->
      <h2 style="font-size:20px;font-weight:600;color:#111827;line-height:1.3;margin-bottom:14px">
        ${lesson.title}
      </h2>

      <!-- Date / time badges -->
      <div class="flex flex-wrap items-center gap-2">
        ${dateText ? `
          <span class="schedule-badge">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            ${dateText}${sessText ? ' · ' + sessText : ''}
          </span>
        ` : ''}
        ${durText ? `
          <span class="schedule-badge">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${durText}
          </span>
        ` : ''}
      </div>
    </div>

    <!-- Scrollable sections -->
    <div class="px-6 py-5" style="display:flex;flex-direction:column;gap:24px">

      <div>
        <p class="ctx-section-heading">Learning Goals</p>
        <p style="font-size:13px;line-height:1.7;color:#374151">${lesson.goals}</p>
      </div>

      <div>
        <p class="ctx-section-heading">Assessment</p>
        <p style="font-size:13px;line-height:1.7;color:#374151">${lesson.assessment}</p>
      </div>

      <div>
        <p class="ctx-section-heading">Adjusting For</p>
        <div class="flex flex-wrap gap-2 mt-2" id="adjusting-for">
          ${selectedIds.length === 0
            ? '<p style="font-size:13px;color:#9CA3AF;font-style:italic">No students selected — click a name in the roster</p>'
            : adjustingPills}
        </div>
      </div>

    </div>
  `

  // Fixed save footer
  if (footer) {
    footer.className = 'planner-save-footer'
    footer.innerHTML = `
      <div style="display:flex;gap:12px">
        <button onclick="applyAllAdjustments()"
          style="flex:1;padding:14px;background:white;color:#059669;
          border:2px solid #059669;border-radius:12px;font-size:15px;
          font-weight:600;cursor:pointer;font-family:inherit;
          transition:background 0.15s"
          onmouseenter="this.style.background='#F0FDF4'"
          onmouseleave="this.style.background='white'">
          Review selected supports
        </button>
        <button onclick="alert('Lesson plan saved!')"
          style="flex:1;height:48px;display:flex;align-items:center;justify-content:center;
                 gap:8px;padding:12px 20px;background:#059669;color:white;font-size:14px;
                 font-weight:500;border:none;border-radius:10px;cursor:pointer;
                 transition:background 0.15s ease"
          onmouseover="this.style.background='#047857'"
          onmouseout="this.style.background='#059669'">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Save lesson plan
        </button>
      </div>
    `
  }
}

function lessonSummaryMeta() {
  const title = isNewLesson ? lessonFormState.title : lesson.title
  const subject = isNewLesson ? lessonFormState.subject : lesson.subject
  const date = isNewLesson ? lessonFormState.date : lesson.date
  const session = isNewLesson ? lessonFormState.session : lesson.session
  return {
    title: title || 'Untitled lesson',
    subject: subject || 'Subject not set',
    timing: [date, session].filter(Boolean).join(' · ') || 'Time not set',
  }
}

function currentLessonSnapshot() {
  return {
    id: lesson?.id || currentLessonId || 'new',
    title: isNewLesson || isEditLesson ? lessonFormState.title : lesson.title,
    subject: isNewLesson || isEditLesson ? lessonFormState.subject : lesson.subject,
    date: isNewLesson || isEditLesson ? lessonFormState.date : lesson.date,
    session: isNewLesson || isEditLesson ? lessonFormState.session : lesson.session,
    duration: isNewLesson || isEditLesson ? lessonFormState.duration : lesson.duration,
    goals: isNewLesson || isEditLesson ? lessonFormState.goals : lesson.goals,
  }
}

function exportLessonSupportPlan() {
  const snapshot = currentLessonSnapshot()
  const year = isNewLesson || isEditLesson ? lessonFormState.year : lesson.year
  const assessment = isNewLesson || isEditLesson ? lessonFormState.assessment : lesson.assessment
  const generatedAt = new Date().toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const students = selectedIds.map((id) => window.AdjustStore.getStudent(id)).filter(Boolean)
  const reviewedSupports = adjustments.filter((adj) => adj.checked)
  const studentRows = students.length
    ? students.map((student) => {
        const tags = student.needs.map((need) => need.label).join(', ')
        return `<li><strong>${escapeHtml(student.name)}</strong> — ${escapeHtml(tags || 'No support focus tags')}</li>`
      }).join('')
    : '<li>No students selected</li>'
  const supportRows = reviewedSupports.length
    ? reviewedSupports.map((support) => `
      <li>
        <div class="suggestion">✓ <strong>${escapeHtml(support.studentName)}:</strong> ${escapeHtml(support.description)}</div>
        <div class="why">Why this helps: ${escapeHtml(support.why || 'This connects the suggestion to the student profile and lesson context.')}</div>
      </li>
    `).join('')
    : '<li>No support suggestions reviewed yet</li>'

  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Lesson Support Plan</title>
  <style>@media print { body { margin: 20mm; } }</style>
  <style>
    body {
      margin: 0;
      background: #ffffff;
      color: #1f2937;
      font-family: Arial, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 36px;
    }
    .header {
      border: 1px solid #d7e7dd;
      border-left: 8px solid #1a7a4a;
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 30px;
    }
    .brand {
      color: #1a7a4a;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .subtitle {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 6px;
    }
    .generated {
      color: #6b7280;
      font-size: 13px;
      margin: 0;
    }
    h2 {
      color: #1a7a4a;
      font-size: 13px;
      letter-spacing: 0.08em;
      margin: 28px 0 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #d1d5db;
      text-transform: uppercase;
    }
    dl {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 8px 16px;
      margin: 0;
    }
    dt {
      color: #4b5563;
      font-weight: 700;
    }
    dd {
      margin: 0;
    }
    p {
      margin: 0;
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    li {
      margin: 8px 0;
    }
    .suggestion {
      font-weight: 500;
    }
    .why {
      color: #6b7280;
      font-size: 13px;
      margin: 3px 0 0 22px;
    }
    .reminder {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      color: #14532d;
      padding: 14px 16px;
    }
    .footer {
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      color: #6b7280;
      font-size: 12px;
      margin-top: 32px;
      padding: 14px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <p class="brand">● Adjust</p>
      <p class="subtitle">Lesson Support Plan</p>
      <p class="generated">Generated: ${escapeHtml(generatedAt)}</p>
    </header>

    <section>
      <h2>Lesson Details</h2>
      <dl>
        <dt>Lesson title:</dt><dd>${escapeHtml(snapshot.title || 'Untitled lesson')}</dd>
        <dt>Subject:</dt><dd>${escapeHtml(snapshot.subject || 'Subject not set')}</dd>
        <dt>Year level:</dt><dd>${escapeHtml(year || 'Year level not set')}</dd>
        <dt>Date:</dt><dd>${escapeHtml(snapshot.date || 'Date not set')}</dd>
        <dt>Period:</dt><dd>${escapeHtml(snapshot.session || 'Period not set')}</dd>
        <dt>Duration:</dt><dd>${escapeHtml(snapshot.duration || 'Duration not set')}</dd>
      </dl>
    </section>

    <section>
      <h2>Learning Goals</h2>
      <p>${escapeHtml(snapshot.goals || 'Learning goals not added yet.')}</p>
    </section>

    <section>
      <h2>Assessment</h2>
      <p>${escapeHtml(assessment || 'Assessment notes not added yet.')}</p>
    </section>

    <section>
      <h2>Students Receiving Support (${students.length} students)</h2>
      <ul>${studentRows}</ul>
    </section>

    <section>
      <h2>Support Suggestions (${reviewedSupports.length} reviewed)</h2>
      <ul>${supportRows}</ul>
    </section>

    <section>
      <h2>Teacher Reminder</h2>
      <p class="reminder">These suggestions are starting points. Please adapt them using your professional judgement.</p>
    </section>

    <footer class="footer">
      <strong>Adjust · Teacher-led support planning</strong><br />
      This document contains sensitive student information. Share only with authorised staff.
    </footer>
  </main>
</body>
</html>`

  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lesson-support-plan.html'
  a.click()
  URL.revokeObjectURL(url)

  if (window.trackEvent) {
    trackEvent('report_exported', { pageId: 'planner', lessonId: snapshot.id })
  }
}

function showShareLessonModal() {
  if (document.getElementById('planner-share-modal')) return

  const snapshot = currentLessonSnapshot()
  const shareUrl = `https://adjust.school/plans/${encodeURIComponent(snapshot.id || 'new')}`
  const overlay = document.createElement('div')
  overlay.id = 'planner-share-modal'
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(15,23,42,.42)',
    backdropFilter: 'blur(4px)',
    zIndex: '9997',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    animation: 'adjFadeIn .2s ease',
  })

  overlay.innerHTML = `
    <div role="dialog" aria-modal="true" aria-labelledby="planner-share-title"
      style="background:white;border-radius:20px;max-width:440px;width:100%;
             box-shadow:0 24px 64px rgba(15,23,42,.22);animation:adjFadeIn .2s ease">
      <div style="padding:24px 24px 18px;border-bottom:1px solid #F3F4F6">
        <h2 id="planner-share-title" style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">
          Share this lesson plan
        </h2>
        <p style="font-size:13px;color:#6B7280;line-height:1.6;margin:0">
          Copy the link below to share with your support coordinator or colleague.
        </p>
      </div>
      <div style="padding:18px 24px;border-bottom:1px solid #F3F4F6">
        <input id="planner-share-link" readonly value="${escapeHtml(shareUrl)}"
          style="width:100%;box-sizing:border-box;border:1px solid #E5E7EB;border-radius:10px;
                 padding:10px 12px;font-size:13px;color:#374151;font-family:inherit;background:#F9FAFB" />
      </div>
      <div style="padding:16px 24px;display:flex;align-items:center;justify-content:flex-end;gap:10px">
        <button id="planner-share-close"
          style="padding:9px 18px;border:1px solid #E5E7EB;border-radius:8px;
                 background:white;font-size:13px;font-weight:500;color:#374151;
                 cursor:pointer;font-family:inherit">Close
        </button>
        <button id="planner-share-copy"
          style="padding:9px 18px;border:none;border-radius:8px;background:#1D9E75;
                 font-size:13px;font-weight:600;color:white;cursor:pointer;
                 font-family:inherit">Copy link
        </button>
      </div>
    </div>
  `

  const close = () => overlay.remove()
  document.body.appendChild(overlay)

  const input = overlay.querySelector('#planner-share-link')
  const copyButton = overlay.querySelector('#planner-share-copy')
  input.focus()
  input.select()

  overlay.querySelector('#planner-share-close').addEventListener('click', close)
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      input.select()
      document.execCommand('copy')
    }
    copyButton.textContent = 'Copied!'
    window.setTimeout(() => {
      if (document.body.contains(copyButton)) copyButton.textContent = 'Copy link'
    }, 2000)
  })
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })

  if (window.trackEvent) {
    trackEvent('lesson_share_opened', { lessonId: snapshot.id })
  }
}

function supportSummaryItems() {
  const categoryPriority = {
    Materials: 0,
    Participation: 1,
    Assessment: 2,
    Technology: 3,
  }
  const reviewed = adjustments.filter((adj) => adj.checked)
  const source = reviewed.length ? reviewed : adjustments
  return [...source]
    .sort((a, b) => (categoryPriority[a.category] ?? 99) - (categoryPriority[b.category] ?? 99))
    .slice(0, 5)
}

function renderPreLessonSummary() {
  const root = document.getElementById('prelesson-summary-root')
  if (!root) return

  const meta = lessonSummaryMeta()
  const students = selectedIds.map((id) => window.AdjustStore.getStudent(id)).filter(Boolean)
  const supportItems = supportSummaryItems()

  const studentRows = students.length
    ? students.map((student) => {
        const strength = student.strengths?.[0] || 'Benefits from clear, planned support.'
        return `
          <li style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #F3F4F6">
            <div class="avatar" style="width:28px;height:28px;min-width:28px;font-size:10px;background:${student.avatarBg}">${escapeHtml(student.initials)}</div>
            <div style="min-width:0">
              <p style="font-size:13px;font-weight:600;color:#111827;margin:0">${escapeHtml(student.name)}</p>
              <p style="font-size:12px;line-height:1.5;color:#6B7280;margin:2px 0 0">${escapeHtml(strength)}</p>
            </div>
          </li>
        `
      }).join('')
    : `<li style="font-size:13px;color:#9CA3AF;padding:8px 0">No students selected yet.</li>`

  const supportRows = supportItems.length
    ? supportItems.map((support) => `
        <li style="display:flex;align-items:flex-start;gap:10px;padding:9px 0">
          <span style="width:7px;height:7px;border-radius:999px;background:#059669;flex-shrink:0;margin-top:7px"></span>
          <span style="font-size:13px;line-height:1.55;color:#374151">${escapeHtml(support.description)}</span>
        </li>
      `).join('')
    : `<li style="font-size:13px;color:#9CA3AF;padding:8px 0">No support suggestions reviewed yet.</li>`

  root.innerHTML = `
    <div class="prelesson-overlay" role="presentation" onclick="if(event.target === this) closePreLessonSummary()"
      style="position:fixed;inset:0;z-index:9997;background:rgba(15,23,42,0.38);display:flex;justify-content:flex-end">
      <aside class="surface-card prelesson-panel" role="dialog" aria-modal="true" aria-labelledby="prelesson-title"
        style="width:min(440px,100%);height:100%;border-radius:18px 0 0 18px;box-shadow:-18px 0 42px rgba(15,23,42,0.18);display:flex;flex-direction:column;background:white">
        <div style="padding:22px 24px 16px;border-bottom:1px solid #F3F4F6">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
            <div>
              <p class="planner-col-label" style="margin:0 0 8px;color:#059669">Before class</p>
              <h2 id="prelesson-title" style="font-size:20px;font-weight:700;color:#111827;margin:0">Pre-lesson summary</h2>
            </div>
            <button type="button" onclick="closePreLessonSummary()" aria-label="Close pre-lesson summary"
              style="background:white;border:1px solid #E5E7EB;border-radius:10px;color:#6B7280;cursor:pointer;font-size:18px;line-height:1;padding:7px 10px;font-family:inherit">
              &times;
            </button>
          </div>
          <div style="margin-top:16px;padding:14px;border-radius:14px;background:#F0FDF4;border:1px solid #D1FAE5">
            <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 5px">${escapeHtml(meta.title)}</p>
            <p style="font-size:13px;color:#047857;margin:0">${escapeHtml(meta.subject)} · ${escapeHtml(meta.timing)}</p>
          </div>
        </div>

        <div style="padding:18px 24px;overflow-y:auto;flex:1">
          <section style="margin-bottom:20px">
            <h3 style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;margin:0 0 8px">Students to keep in mind</h3>
            <ul style="list-style:none;margin:0;padding:0">${studentRows}</ul>
          </section>

          <section>
            <h3 style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;margin:0 0 8px">Reviewed supports</h3>
            <ul style="list-style:none;margin:0;padding:0">${supportRows}</ul>
          </section>
        </div>

        <div style="padding:16px 24px;border-top:1px solid #F3F4F6;display:flex;gap:10px">
          <button type="button" onclick="closePreLessonSummary()" class="btn-ghost" style="flex:1">Back</button>
          <button type="button" onclick="savePreLessonSummary()" class="btn-solid" style="flex:1">Ready to teach</button>
        </div>
      </aside>
    </div>
  `

  const closeButton = root.querySelector('[aria-label="Close pre-lesson summary"]')
  closeButton?.focus()
}

function closePreLessonSummary() {
  const root = document.getElementById('prelesson-summary-root')
  if (root) root.innerHTML = ''
}

function savePreLessonSummary() {
  let savedId = lesson.id
  const lessonPayload = {
    subject: lesson.subject,
    year: lesson.year,
    title: lesson.title,
    date: lesson.date,
    session: lesson.session,
    duration: lesson.duration,
    goals: lesson.goals,
    assessment: lesson.assessment,
    studentIds: selectedIds,
  }

  if (lesson.id) {
    window.AdjustStore.updateLesson(lesson.id, lessonPayload)
  } else {
    const saved = window.AdjustStore.saveLesson(lessonPayload)
    savedId = saved.id
    lesson = saved
  }

  if (window.trackEvent) {
    trackEvent('prelesson_ready_to_teach', {
      lessonId: savedId,
      reviewedSupports: adjustments.filter((adj) => adj.checked).length,
      studentsSelected: selectedIds.length,
    })
  }

  closePreLessonSummary()
}

// ─── Render: Support suggestions (right column) ─────────────────────────────
function renderAdjustments() {
  const filtersEl     = document.getElementById('adj-filters')
  const list          = document.getElementById('adjustments-list')
  const progressLabel = document.getElementById('adj-progress-label')
  const progressBar   = document.getElementById('adj-progress-bar')

  // ── Nothing selected ──────────────────────────────────────────────────────
  if (selectedIds.length === 0) {
    if (filtersEl) filtersEl.innerHTML = ''
    list.innerHTML = `
      <div style="text-align:center;padding:32px 12px">
        <div style="width:40px;height:40px;border-radius:50%;background:#F3F4F6;
             display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
          <svg width="18" height="18" fill="none" stroke="#9CA3AF" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                 M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                 m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <p style="font-size:12px;color:#6B7280;font-weight:500">Select students from the roster</p>
        <p style="font-size:11px;color:#9CA3AF;margin-top:4px">Support suggestions will appear here</p>
      </div>
    `
    if (progressLabel) progressLabel.textContent = '0 / 0 reviewed'
    if (progressBar)   progressBar.style.width   = '0%'
    return
  }

  // ── Filter pills ──────────────────────────────────────────────────────────
  const CATEGORIES = ['All', 'Materials', 'Participation', 'Assessment', 'Technology']
  if (filtersEl) {
    filtersEl.innerHTML = CATEGORIES.map(cat => {
      const key      = cat.toLowerCase()
      const isActive = activeFilter === key
      // Count how many adjustments match this category (excluding 'all')
      const count = key === 'all' ? adjustments.length
        : adjustments.filter(a => a.category.toLowerCase() === key).length
      const countBadge = count > 0 && key !== 'all'
        ? `<span style="font-size:10px;font-weight:700;margin-left:3px">${count}</span>` : ''
      return `<button class="adj-filter-btn ${isActive ? 'active' : ''}"
        onclick="setAdjFilter('${key}')">${cat}${countBadge}</button>`
    }).join('')
  }

  // ── Filter + render cards ─────────────────────────────────────────────────
  const categoryPriority = {
    materials: 0,
    participation: 1,
    assessment: 2,
    technology: 3,
  }
  const visible = (activeFilter === 'all'
    ? [...adjustments]
    : adjustments.filter(a => a.category.toLowerCase() === activeFilter)
  ).sort((a, b) => {
    const aPriority = categoryPriority[a.category.toLowerCase()] ?? 99
    const bPriority = categoryPriority[b.category.toLowerCase()] ?? 99
    return aPriority - bPriority
  })

  if (adjustments.length === 0) {
    list.innerHTML = `<p style="font-size:12px;color:#9CA3AF;font-style:italic;text-align:center;margin-top:24px">
      Support suggestions will appear as you build the lesson.</p>`
  } else if (visible.length === 0) {
    list.innerHTML = `<p style="font-size:12px;color:#9CA3AF;font-style:italic;text-align:center;margin-top:24px">
      No ${activeFilter} suggestions for the selected students.</p>`
  } else {
    list.innerHTML = visible.map((adj, index) => {
      const student = window.AdjustStore.getStudent(adj.studentId)
      const categoryKey = adj.category.toUpperCase()
      const accent = categoryKey === 'MATERIALS'
        ? '#3B82F6'
        : categoryKey === 'PARTICIPATION'
        ? '#F59E0B'
        : categoryKey === 'ASSESSMENT'
        ? '#8B5CF6'
        : categoryKey === 'TECHNOLOGY'
        ? '#10B981'
        : '#D1D5DB'
      const tint = categoryKey === 'MATERIALS'
        ? '#EFF6FF'
        : categoryKey === 'PARTICIPATION'
        ? '#FFFBEB'
        : categoryKey === 'ASSESSMENT'
        ? '#F5F3FF'
        : categoryKey === 'TECHNOLOGY'
        ? '#ECFDF5'
        : '#FFFFFF'

      const isEditing = editingSuggestionId === adj.id
      const descriptionBlock = isEditing
        ? `
          <textarea id="support-edit-input" class="support-edit-textarea">${escapeHtml(adj.description)}</textarea>
          <div class="support-card-actions">
            <button type="button" class="support-card-action primary" onclick="saveSupportEdit('${adj.id}')">Save edit</button>
            <button type="button" class="support-card-action" onclick="cancelSupportEdit()">Cancel</button>
          </div>
        `
        : `
          <p style="font-size:13px;line-height:1.65;color:#374151;margin:0;
            text-decoration:${adj.checked ? 'line-through' : 'none'};
            transition:opacity 0.2s ease,text-decoration-color 0.2s ease">${escapeHtml(adj.description)}</p>
          ${adj.editedByTeacher ? '<span class="teacher-edited-badge">Edited by teacher</span>' : ''}
          <p style="font-size:11px;line-height:1.55;color:#6B7280;margin:7px 0 0">
            <span style="font-weight:600;color:#374151">Why this helps:</span>
            ${escapeHtml(adj.why || 'This connects the suggestion to the student profile and lesson context.')}
          </p>
          <div class="support-card-actions">
            <button type="button" class="support-card-action" onclick="startSupportEdit('${adj.id}')">Edit</button>
          </div>
        `

      return `
        <div class="adj-card ${adj.checked ? 'checked' : ''}" id="adj-${adj.id}"
          style="border-left:3px solid ${accent};background:${tint};opacity:${adj.checked ? '0.5' : '1'};
          transition:opacity 0.2s ease, background 0.2s ease;border-bottom:${index < visible.length - 1 ? '1px solid #F3F4F6' : 'none'};
          margin-bottom:${index < visible.length - 1 ? '12px' : '0'};padding-bottom:${index < visible.length - 1 ? '12px' : '0'}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:14px">
            <div style="flex:1;min-width:0">
              <span class="adj-cat-badge"
                style="background:${adj.catBg};color:${adj.catText}">${adj.category}</span>
              <div style="display:flex;align-items:center;gap:8px;margin-top:8px;margin-bottom:6px">
                <div class="avatar" style="width:20px;height:20px;min-width:20px;font-size:8px;
                  font-weight:700;background:${student?.avatarBg || '#9CA3AF'}">${student?.initials || ''}</div>
                <p style="font-size:12px;font-weight:500;color:#6B7280;margin:0">${adj.studentName}</p>
              </div>
              ${descriptionBlock}
            </div>
            <label style="display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;position:relative">
              <input type="checkbox" ${adj.checked ? 'checked' : ''}
                onclick="toggleAdjustment('${adj.id}')"
                style="position:absolute;opacity:0;width:1px;height:1px;margin:0" />
              <div class="checkbox-box ${adj.checked ? 'checked' : ''}"
                   style="width:24px;height:24px;min-width:24px;display:flex;align-items:center;justify-content:center;
                   border-radius:8px;flex-shrink:0">
                ${adj.checked
                  ? `<svg width="12" height="12" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                     </svg>`
                  : ''}
              </div>
            </label>
          </div>
        </div>
      `
    }).join('')
  }

  // ── Progress (always based on ALL adjustments, not filtered view) ─────────
  const checked = adjustments.filter(a => a.checked).length
  const total   = adjustments.length
  const pct     = total === 0 ? 0 : Math.round((checked / total) * 100)
  if (progressLabel) progressLabel.textContent = `${checked} / ${total} reviewed`
  if (progressBar)   progressBar.style.width   = pct + '%'
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function saveLessonPlan(event) {
  event.preventDefault()

  if (!lessonFormState.subject.trim() || !lessonFormState.year.trim()) {
    plannerSuccessMessage = 'Add the subject and year level before saving this lesson.'
    renderContext()
    renderAdjustments()
    return
  }

  const title = lessonFormState.title.trim()
    || `${lessonFormState.subject.trim()} lesson`
  const goals = lessonFormState.goals.trim()
    || 'Learning goals to be added.'
  const assessment = lessonFormState.assessment.trim()
    || 'Assessment notes to be added.'
  const lessonPayload = {
    subject: lessonFormState.subject,
    year: lessonFormState.year,
    title,
    date: lessonFormState.date,
    session: lessonFormState.session,
    duration: lessonFormState.duration,
    goals,
    assessment,
    studentIds: selectedIds,
  }

  // ── Save lesson data ───────────────────────────────────────────────────────
  let savedId
  if (isEditLesson && lesson.id) {
    window.AdjustStore.updateLesson(lesson.id, lessonPayload)
    savedId = lesson.id
  } else {
    const saved = window.AdjustStore.saveLesson(lessonPayload)
    savedId = saved.id
  }

  // ── Track lesson_saved ─────────────────────────────────────────────────────
  if (window.trackEvent) {
    trackEvent('lesson_saved', { lessonId: savedId })
  }

  // ── Track lesson_completion_metrics ───────────────────────────────────────
  if (window.trackEvent) {
    trackEvent('lesson_completion_metrics', {
      timeSpentSeconds:  Math.round((Date.now() - _pageStartTime) / 1000),
      adjustmentsChecked: adjustments.filter(a => a.checked).length,
      studentsSelected:   selectedIds.length,
      selectionChanged:   _selectionChanged,
      lessonId:           savedId,
    })
  }

  const redirectUrl = isEditLesson
    ? 'index.html?updated=1'
    : `index.html?created=${savedId}`

  // ── Micro-feedback toast ───────────────────────────────────────────────────
  if (window.AdjustFeedback) {
    AdjustFeedback.showMicroFeedback({
      question: 'Did this suggestion support inclusive planning?',
      options:  ['Yes, helped me think about students', 'Somewhat', 'Not really'],
      context:  'lesson_save',
    })
  }

  if (!isEditLesson) {
    location.href = redirectUrl
    return
  }

  // ── Reflection modal — redirects on dismiss ────────────────────────────────
  if (window.AdjustFeedback) {
    AdjustFeedback.showReflectionModal(savedId, {
      onDone: () => { location.href = redirectUrl },
    })
  } else {
    location.href = redirectUrl
  }
}

function toggleStudent(id) {
  const wasSelected = selectedIds.includes(id)
  if (wasSelected) {
    selectedIds = selectedIds.filter(s => s !== id)
  } else {
    selectedIds.push(id)
  }

  // ── Track interaction ──────────────────────────────────────────────────────
  if (window.trackEvent) {
    const student = window.AdjustStore?.getStudent?.(id)
    trackEvent(wasSelected ? 'student_deselected' : 'student_selected', {
      studentId:   id,
      studentName: student?.name || id,
      lessonId:    lesson?.id || 'new',
    })
  }

  // Mark if selection ever diverges from the initial state
  if (!_selectionChanged) {
    const cur  = [...selectedIds].sort().join(',')
    const init = [..._initialSelectedIds].sort().join(',')
    if (cur !== init) _selectionChanged = true
  }

  syncAdjustments()
  renderRoster()
  renderContext()
  renderAdjustments()
}

function toggleAdjustment(id) {
  const adj = adjustments.find(a => a.id === id)
  if (!adj) return
  adj.checked = !adj.checked

  // ── Track interaction ──────────────────────────────────────────────────────
  if (window.trackEvent) {
    trackEvent(adj.checked ? 'adjustment_checked' : 'adjustment_unchecked', {
      adjustmentId: id,
      category:     adj.category,
      studentName:  adj.studentName,
      lessonId:     lesson?.id || 'new',
    })
  }

  // ── Micro-feedback toast after checking ────────────────────────────────────
  // if (adj.checked && window.AdjustFeedback) {
  //   AdjustFeedback.showMicroFeedback({
  //     question: 'Was this adjustment useful?',
  //     options:  ['Yes, very useful', 'Somewhat', 'Not really'],
  //     context:  `adjustment:${id}`,
  //   })
  // }

  renderAdjustments()
}

function startSupportEdit(id) {
  editingSuggestionId = id
  renderAdjustments()
  document.getElementById('support-edit-input')?.focus()
}

function cancelSupportEdit() {
  editingSuggestionId = null
  renderAdjustments()
}

function saveSupportEdit(id) {
  const input = document.getElementById('support-edit-input')
  const nextText = input?.value.trim()
  if (!nextText) return

  editedSuggestions[id] = nextText
  const adj = adjustments.find((item) => item.id === id)
  if (adj) {
    adj.description = nextText
    adj.editedByTeacher = true
  }

  if (window.trackEvent) {
    trackEvent('support_suggestion_edited', {
      adjustmentId: id,
      lessonId: lesson?.id || 'new',
    })
  }

  editingSuggestionId = null
  renderAdjustments()
}

function filterRoster(value) {
  rosterSearch = value
  renderRoster()
}

function setAdjFilter(key) {
  activeFilter = key
  renderAdjustments()
}

function applyAllAdjustments() {
  renderPreLessonSummary()
  trackEvent('prelesson_summary_opened', { lessonId: currentLessonId })
}

// ─── Expose to HTML onclick handlers ──────────────────────────────────────────
window.applyAllAdjustments = applyAllAdjustments
window.closePreLessonSummary = closePreLessonSummary
window.savePreLessonSummary = savePreLessonSummary
window.startSupportEdit = startSupportEdit
window.cancelSupportEdit = cancelSupportEdit
window.saveSupportEdit = saveSupportEdit
window.toggleStudent    = toggleStudent
window.toggleAdjustment = toggleAdjustment
window.filterRoster     = filterRoster
window.setAdjFilter     = setAdjFilter

// ─── Initial render ───────────────────────────────────────────────────────────
updateBreadcrumb()
renderRoster()
renderContext()
renderAdjustments()
