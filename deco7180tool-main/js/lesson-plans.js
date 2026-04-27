renderSidebar('lessons')

const topSubtitle = document.getElementById('lesson-summary')
const newLessonButton = document.getElementById('new-lesson-btn')
const createdBanner = document.getElementById('lesson-created-banner')
let openMenuId = null

function subjectChipStyle(subject) {
  const value = String(subject || '').toUpperCase()
  if (value.includes('MATH')) return { bg: '#DBEAFE', text: '#1D4ED8' }
  if (value.includes('ENGLISH')) return { bg: '#EDE9FE', text: '#5B21B6' }
  if (value.includes('SCIENCE')) return { bg: '#D1FAE5', text: '#065F46' }
  return { bg: '#ECFDF5', text: '#047857' }
}

function avatarStack(studentIds) {
  return studentIds.map((id) => {
    const student = window.AdjustStore.getStudent(id)
    if (!student) return ''
    return `<div class="avatar ring-2 ring-white" style="background:${student.avatarBg};margin-left:-6px;" title="${student.name}">${student.initials}</div>`
  }).join('')
}

function updateCounts(lessons, students) {
  topSubtitle.textContent = `${lessons.length} lessons · ${students.length} SEN students`
}

function renderLessonCards() {
  const lessons = window.AdjustStore.getLessons()
  const students = window.AdjustStore.getStudents()
  const grid = document.getElementById('lesson-grid')

  updateCounts(lessons, students)

  const cards = lessons.map((lesson) => {
    const adjustmentCount = window.AdjustStore.lessonAdjustmentCount(lesson, students)
    const chip = subjectChipStyle(lesson.subject)

    return `
      <div class="lesson-card relative"
           data-lesson-id="${lesson.id}">
        <div class="lesson-card-menu">
          <button class="lesson-card-menu-btn" type="button" data-menu-trigger="${lesson.id}" aria-label="Open lesson actions" aria-expanded="${openMenuId === lesson.id ? 'true' : 'false'}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8"></circle>
              <circle cx="12" cy="12" r="1.8"></circle>
              <circle cx="19" cy="12" r="1.8"></circle>
            </svg>
          </button>
          <div class="lesson-card-dropdown ${openMenuId === lesson.id ? 'open' : ''}" data-menu="${lesson.id}">
            <button type="button" data-menu-action="edit" data-lesson-id="${lesson.id}">Edit</button>
            <button type="button" data-menu-action="delete" data-lesson-id="${lesson.id}">Delete</button>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-3">
          <span class="tag" style="background:${chip.bg};color:${chip.text}">${lesson.subject}</span>
          <span style="font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280">${lesson.year}</span>
        </div>
        <h3 class="lesson-title" style="font-size:15px;font-weight:600;color:#111827;line-height:1.45;margin:0 0 14px">
          ${lesson.title}
        </h3>
        <div class="flex items-center gap-2 mb-5" style="font-size:13px;color:#6B7280">
          <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
          </svg>
          <span>${lesson.schedule}</span>
        </div>
        <div class="flex items-center justify-between pt-4" style="border-top:1px solid #F3F4F6">
          <div class="flex" style="padding-left:6px">${avatarStack(lesson.studentIds)}</div>
          <span style="font-size:13px;color:#6B7280;font-weight:500">${adjustmentCount} adjustments</span>
        </div>
      </div>
    `
  }).join('')

  const addCard = `
    <button class="add-card w-full text-left" onclick="location.href='planner.html?new=1'">
      <div class="add-icon">+</div>
      <span class="add-label">Add new lesson</span>
    </button>
  `

  grid.innerHTML = cards + addCard
}

function closeMenus() {
  if (openMenuId === null) return
  openMenuId = null
  renderLessonCards()
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-menu-trigger]')
  const action = event.target.closest('[data-menu-action]')
  const card = event.target.closest('[data-lesson-id]')

  if (trigger) {
    event.stopPropagation()
    const lessonId = trigger.getAttribute('data-menu-trigger')
    openMenuId = openMenuId === lessonId ? null : lessonId
    renderLessonCards()
    return
  }

  if (action) {
    event.stopPropagation()
    const lessonId = action.getAttribute('data-lesson-id')
    const actionType = action.getAttribute('data-menu-action')
    openMenuId = null

    if (actionType === 'edit') {
      location.href = `planner.html?id=${lessonId}&edit=1`
      return
    }

    if (actionType === 'delete') {
      const lesson = window.AdjustStore.getLesson(lessonId)
      const confirmed = window.confirm(`Delete "${lesson?.title || 'this lesson'}"? This will remove it from this week's plans.`)
      if (!confirmed) {
        renderLessonCards()
        return
      }

      window.AdjustStore.deleteLesson(lessonId)
      renderLessonCards()
      return
    }
  }

  if (card) {
    const lessonId = card.getAttribute('data-lesson-id')
    location.href = `planner.html?id=${lessonId}`
    return
  }

  closeMenus()
})

newLessonButton?.addEventListener('click', () => {
  location.href = 'planner.html?new=1'
})

const lessonPageParams = new URLSearchParams(location.search)

if (lessonPageParams.get('created')) {
  createdBanner.classList.remove('hidden')
  window.setTimeout(() => createdBanner.classList.add('hidden'), 2600)
}

if (lessonPageParams.get('updated')) {
  createdBanner.textContent = 'Lesson updated successfully.'
  createdBanner.classList.remove('hidden')
  window.setTimeout(() => createdBanner.classList.add('hidden'), 2600)
}

renderLessonCards()
