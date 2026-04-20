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

let selectedIds  = [...(lesson.studentIds || [])]
let adjustments  = window.AdjustStore.generateAdjustmentSuggestions(lesson, selectedIds)
let plannerSuccessMessage = ''

// ── UI filter / search state ───────────────────────────────────────────────────
let activeFilter = 'all'   // 'all' | 'materials' | 'participation' | 'assessment' | 'technology'
let rosterSearch = ''

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

function syncAdjustments() {
  adjustments = window.AdjustStore.generateAdjustmentSuggestions(
    { ...lesson, ...lessonFormState, subject: lessonFormState.subject.toUpperCase() },
    selectedIds
  )
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
          `<span class="tag" style="background:${n.bg};color:${n.text}">${n.label}</span>`
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
                Choose students from the roster to tailor suggested adjustments.
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
      <button onclick="alert('Lesson plan saved!')"
        style="width:100%;height:48px;display:flex;align-items:center;justify-content:center;
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
    `
  }
}

// ─── Render: Suggested Adjustments (right column) ─────────────────────────────
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
        <p style="font-size:11px;color:#9CA3AF;margin-top:4px">Adjustments will appear here</p>
      </div>
    `
    if (progressLabel) progressLabel.textContent = '0 / 0 done'
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
  const visible = activeFilter === 'all'
    ? adjustments
    : adjustments.filter(a => a.category.toLowerCase() === activeFilter)

  if (adjustments.length === 0) {
    list.innerHTML = `<p style="font-size:12px;color:#9CA3AF;font-style:italic;text-align:center;margin-top:24px">
      Suggestions will appear as you build the lesson.</p>`
  } else if (visible.length === 0) {
    list.innerHTML = `<p style="font-size:12px;color:#9CA3AF;font-style:italic;text-align:center;margin-top:24px">
      No ${activeFilter} adjustments for the selected students.</p>`
  } else {
    list.innerHTML = visible.map(adj => `
      <div class="adj-card ${adj.checked ? 'checked' : ''}" id="adj-${adj.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <div style="flex:1;min-width:0">
            <!-- Category badge -->
            <span class="adj-cat-badge"
              style="background:${adj.catBg};color:${adj.catText}">${adj.category}</span>
            <!-- Student name -->
            <p style="font-size:12px;font-weight:500;color:#6B7280;margin-top:6px;margin-bottom:4px">
              ${adj.studentName}
            </p>
            <!-- Description — never truncated -->
            <p style="font-size:13px;line-height:1.65;color:#374151">${adj.description}</p>
          </div>
          <!-- Checkbox (top-right, 18px) -->
          <div class="checkbox-box ${adj.checked ? 'checked' : ''}"
               onclick="toggleAdjustment('${adj.id}')"
               style="margin-top:2px;flex-shrink:0">
            ${adj.checked
              ? `<svg width="10" height="10" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                 </svg>`
              : ''}
          </div>
        </div>
      </div>
    `).join('')
  }

  // ── Progress (always based on ALL adjustments, not filtered view) ─────────
  const checked = adjustments.filter(a => a.checked).length
  const total   = adjustments.length
  const pct     = total === 0 ? 0 : Math.round((checked / total) * 100)
  if (progressLabel) progressLabel.textContent = `${checked} / ${total} done`
  if (progressBar)   progressBar.style.width   = pct + '%'
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function saveLessonPlan(event) {
  event.preventDefault()
  if (!lessonFormState.title.trim() || !lessonFormState.subject.trim()
    || !lessonFormState.goals.trim() || !lessonFormState.assessment.trim()) {
    plannerSuccessMessage = 'Complete the lesson title, subject, learning goals, and assessment before saving.'
    renderContext()
    renderAdjustments()
    return
  }

  // ── Save lesson data ───────────────────────────────────────────────────────
  let savedId
  if (isEditLesson && lesson.id) {
    window.AdjustStore.updateLesson(lesson.id, {
      subject: lessonFormState.subject, year: lessonFormState.year,
      title: lessonFormState.title,    date: lessonFormState.date,
      session: lessonFormState.session, duration: lessonFormState.duration,
      goals: lessonFormState.goals,    assessment: lessonFormState.assessment,
      studentIds: selectedIds,
    })
    savedId = lesson.id
  } else {
    const saved = window.AdjustStore.saveLesson({
      subject: lessonFormState.subject, year: lessonFormState.year,
      title: lessonFormState.title,    date: lessonFormState.date,
      session: lessonFormState.session, duration: lessonFormState.duration,
      goals: lessonFormState.goals,    assessment: lessonFormState.assessment,
      studentIds: selectedIds,
    })
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
  if (adj.checked && window.AdjustFeedback) {
    AdjustFeedback.showMicroFeedback({
      question: 'Was this adjustment useful?',
      options:  ['Yes, very useful', 'Somewhat', 'Not really'],
      context:  `adjustment:${id}`,
    })
  }

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

// ─── Expose to HTML onclick handlers ──────────────────────────────────────────
window.toggleStudent    = toggleStudent
window.toggleAdjustment = toggleAdjustment
window.filterRoster     = filterRoster
window.setAdjFilter     = setAdjFilter

// ─── Initial render ───────────────────────────────────────────────────────────
updateBreadcrumb()
renderRoster()
renderContext()
renderAdjustments()
