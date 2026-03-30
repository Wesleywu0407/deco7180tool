renderSidebar('lessons')

const topSubtitle = document.getElementById('lesson-summary')
const newLessonButton = document.getElementById('new-lesson-btn')
const createdBanner = document.getElementById('lesson-created-banner')
let openMenuId = null

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

    return `
      <div class="lesson-card bg-white border border-gray-200 rounded-xl p-5 relative"
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
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          ${lesson.subject} · ${lesson.year}
        </p>
        <h3 class="lesson-title text-sm font-semibold text-gray-900 leading-snug mb-3 transition-colors">
          ${lesson.title}
        </h3>
        <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
          </svg>
          <span>${lesson.schedule}</span>
        </div>
        <hr class="border-gray-100 mb-4"/>
        <div class="flex items-center justify-between">
          <div class="flex" style="padding-left:6px">${avatarStack(lesson.studentIds)}</div>
          <span class="text-xs text-gray-500 font-medium">${adjustmentCount} adjustments</span>
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
