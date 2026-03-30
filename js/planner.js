renderSidebar('lessons')

const params = new URLSearchParams(location.search)
const isNewLesson = params.get('new') === '1'
const lessonId = params.get('id')
const isEditLesson = params.get('edit') === '1'

const fallbackLesson = window.AdjustStore.getLessons()[0]
let lesson = isNewLesson
  ? {
      subject: 'Mathematics',
      year: 'Year 5',
      title: '',
      date: 'Friday',
      session: 'Period 1',
      duration: '60 min',
      goals: '',
      assessment: '',
      studentIds: [],
    }
  : (window.AdjustStore.getLesson(lessonId) || fallbackLesson)

let selectedIds = [...(lesson.studentIds || [])]
let adjustments = window.AdjustStore.generateAdjustmentSuggestions(lesson, selectedIds)
let plannerSuccessMessage = ''

const lessonFormState = {
  subject: lesson.subject,
  year: lesson.year,
  title: lesson.title,
  date: lesson.date,
  session: lesson.session,
  duration: lesson.duration,
  goals: lesson.goals,
  assessment: lesson.assessment,
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function syncAdjustments() {
  adjustments = window.AdjustStore.generateAdjustmentSuggestions(
    {
      ...lesson,
      ...lessonFormState,
      subject: lessonFormState.subject.toUpperCase(),
    },
    selectedIds
  )
}

function renderContext() {
  const pills = selectedIds.map((id) => {
    const student = window.AdjustStore.getStudent(id)
    if (!student) return ''
    return `
      <div class="flex items-center gap-1.5 px-3 py-1 border border-[#1D9E75] rounded-full">
        <div class="avatar" style="width:20px;height:20px;font-size:9px;background:${student.avatarBg}">${student.initials}</div>
        <span class="text-xs font-medium text-[#1D9E75]">${student.name}</span>
      </div>
    `
  }).join('')

  const adjustingFor = selectedIds.length === 0
    ? '<p class="text-xs text-gray-400 italic">No students selected</p>'
    : pills

  if (isNewLesson || isEditLesson) {
    document.getElementById('lesson-context').innerHTML = `
      <div class="surface-card p-5 mb-5">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <p class="page-label mb-2">${isEditLesson ? 'Edit lesson' : 'Create lesson'}</p>
            <h2 class="text-base font-semibold text-gray-900">${isEditLesson ? 'Update lesson plan' : 'New lesson plan'}</h2>
            <p class="text-sm text-gray-500 mt-1">${isEditLesson ? 'Update the lesson details, roster, and support plan.' : 'Build a lesson, choose the students you are adjusting for, and save it back to this week\'s plan.'}</p>
          </div>
        </div>
        ${plannerSuccessMessage ? `<div class="status-banner mb-4">${plannerSuccessMessage}</div>` : ''}
        <form id="lesson-edit-form" class="space-y-5">
          <div class="settings-profile-grid">
            <div>
              <label class="field-label" for="lesson-subject">Subject</label>
              <input id="lesson-subject" name="subject" class="input-shell" value="${escapeHtml(lessonFormState.subject)}" />
            </div>
            <div>
              <label class="field-label" for="lesson-year">Year level</label>
              <input id="lesson-year" name="year" class="input-shell" value="${escapeHtml(lessonFormState.year)}" />
            </div>
            <div class="full-span">
              <label class="field-label" for="lesson-title">Lesson title</label>
              <input id="lesson-title" name="title" class="input-shell" value="${escapeHtml(lessonFormState.title)}" />
            </div>
            <div>
              <label class="field-label" for="lesson-date">Date</label>
              <input id="lesson-date" name="date" class="input-shell" value="${escapeHtml(lessonFormState.date)}" />
            </div>
            <div>
              <label class="field-label" for="lesson-session">Session</label>
              <input id="lesson-session" name="session" class="input-shell" value="${escapeHtml(lessonFormState.session)}" />
            </div>
            <div>
              <label class="field-label" for="lesson-duration">Duration</label>
              <input id="lesson-duration" name="duration" class="input-shell" value="${escapeHtml(lessonFormState.duration)}" />
            </div>
            <div class="full-span">
              <label class="field-label" for="lesson-goals">Learning goals</label>
              <textarea id="lesson-goals" name="goals" class="input-shell min-h-[96px]">${escapeHtml(lessonFormState.goals)}</textarea>
            </div>
            <div class="full-span">
              <label class="field-label" for="lesson-assessment">Assessment</label>
              <textarea id="lesson-assessment" name="assessment" class="input-shell min-h-[96px]">${escapeHtml(lessonFormState.assessment)}</textarea>
            </div>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Adjusting for</p>
            <div class="flex flex-wrap gap-2" id="adjusting-for">${adjustingFor}</div>
          </div>
          <div class="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <p class="text-xs text-gray-400">Choose students from the class roster to tailor suggested adjustments.</p>
            <div class="flex items-center gap-3">
              <button type="button" class="btn-ghost" id="cancel-new-lesson">Cancel</button>
              <button type="submit" class="btn-solid">${isEditLesson ? 'Save changes' : 'Save lesson plan'}</button>
            </div>
          </div>
        </form>
      </div>
    `

    const form = document.getElementById('lesson-edit-form')
    form.addEventListener('input', (event) => {
      const { name, value } = event.target
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

  document.getElementById('lesson-context').innerHTML = `
    <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">${lesson.subject} · ${lesson.year}</p>
      <h2 class="text-base font-semibold text-gray-900 mb-2">${lesson.title}</h2>
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>${lesson.schedule}</span>
      </div>
    </div>

    <div class="mb-5">
      <p class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Learning goals</p>
      <p class="text-sm text-gray-600 leading-relaxed">${lesson.goals}</p>
    </div>

    <div class="mb-5">
      <p class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Assessment</p>
      <p class="text-sm text-gray-600 leading-relaxed">${lesson.assessment}</p>
    </div>

    <div class="mb-6">
      <p class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Adjusting for</p>
      <div class="flex flex-wrap gap-2" id="adjusting-for">${adjustingFor}</div>
    </div>

    <button class="w-full flex items-center justify-center px-4 py-3 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#178a63] transition-colors tracking-wide">
      Save lesson plan
    </button>
  `
}

function renderRoster() {
  const students = window.AdjustStore.getStudents()
  document.getElementById('roster').innerHTML = students.map((student) => {
    const selected = selectedIds.includes(student.id)
    const needTags = student.needs.map((need) =>
      `<span class="tag" style="background:${need.bg};color:${need.text}">${need.label}</span>`
    ).join('')

    return `
      <div class="roster-card ${selected ? 'selected' : ''}" onclick="toggleStudent('${student.id}')">
        <div class="flex items-center gap-2.5">
          <div class="avatar" style="background:${student.avatarBg}">${student.initials}</div>
          <div class="min-w-0">
            <p class="roster-name text-sm font-semibold text-gray-800 truncate">${student.name}</p>
            <div class="flex flex-wrap gap-1 mt-0.5">${needTags}</div>
          </div>
        </div>
      </div>
    `
  }).join('')
}

function renderAdjustments() {
  const list = document.getElementById('adjustments-list')
  const progressSection = document.getElementById('progress-section')

  if (selectedIds.length === 0) {
    list.innerHTML = `<p class="text-xs text-gray-400 italic text-center mt-8">Select students from the roster to see suggested adjustments.</p>`
    progressSection.classList.add('hidden')
    return
  }

  if (adjustments.length === 0) {
    list.innerHTML = `<p class="text-xs text-gray-400 italic text-center mt-8">Suggestions will appear here as you build the lesson.</p>`
    progressSection.classList.add('hidden')
    return
  }

  list.innerHTML = adjustments.map((adjustment) => `
    <div class="adj-card bg-white border border-gray-200 rounded-xl p-4 ${adjustment.checked ? 'checked' : ''}" id="adj-${adjustment.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <span class="tag" style="background:${adjustment.catBg};color:${adjustment.catText}">${adjustment.category}</span>
          <p class="text-xs font-semibold text-gray-700 mt-1 mb-1">${adjustment.studentName}</p>
          <p class="text-xs text-gray-600 leading-relaxed">${adjustment.description}</p>
        </div>
        <div class="checkbox-box ${adjustment.checked ? 'checked' : ''} mt-0.5" onclick="toggleAdjustment('${adjustment.id}')">
          ${adjustment.checked
            ? `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
            : ''}
        </div>
      </div>
    </div>
  `).join('')

  const checked = adjustments.filter((adjustment) => adjustment.checked).length
  const total = adjustments.length
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100)
  progressSection.classList.remove('hidden')
  document.getElementById('progress-label').textContent = `${checked} / ${total} done`
  document.getElementById('progress-fill').style.width = pct + '%'
}

function saveLessonPlan(event) {
  event.preventDefault()

  if (!lessonFormState.title.trim() || !lessonFormState.subject.trim() || !lessonFormState.goals.trim() || !lessonFormState.assessment.trim()) {
    plannerSuccessMessage = 'Complete the lesson title, subject, learning goals, and assessment before saving.'
    renderContext()
    renderAdjustments()
    return
  }

  if (isEditLesson && lesson.id) {
    window.AdjustStore.updateLesson(lesson.id, {
      subject: lessonFormState.subject,
      year: lessonFormState.year,
      title: lessonFormState.title,
      date: lessonFormState.date,
      session: lessonFormState.session,
      duration: lessonFormState.duration,
      goals: lessonFormState.goals,
      assessment: lessonFormState.assessment,
      studentIds: selectedIds,
    })

    location.href = 'index.html?updated=1'
    return
  }

  const savedLesson = window.AdjustStore.saveLesson({
    subject: lessonFormState.subject,
    year: lessonFormState.year,
    title: lessonFormState.title,
    date: lessonFormState.date,
    session: lessonFormState.session,
    duration: lessonFormState.duration,
    goals: lessonFormState.goals,
    assessment: lessonFormState.assessment,
    studentIds: selectedIds,
  })

  location.href = `index.html?created=${savedLesson.id}`
}

function toggleStudent(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter((studentId) => studentId !== id)
  } else {
    selectedIds.push(id)
  }

  syncAdjustments()
  renderRoster()
  renderContext()
  renderAdjustments()
}

function toggleAdjustment(id) {
  const adjustment = adjustments.find((entry) => entry.id === id)
  if (adjustment) {
    adjustment.checked = !adjustment.checked
  }
  renderAdjustments()
}

window.toggleStudent = toggleStudent
window.toggleAdjustment = toggleAdjustment

renderRoster()
renderContext()
renderAdjustments()
