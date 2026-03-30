// ─── Lesson Plans page ────────────────────────────────────────────────────────

renderSidebar('lessons')

function avatarStack(studentIds) {
  return studentIds.map(id => {
    const s = getStudent(id)
    if (!s) return ''
    return `<div class="avatar ring-2 ring-white" style="background:${s.avatarBg};margin-left:-6px;" title="${s.name}">${s.initials}</div>`
  }).join('')
}

function renderLessonCards() {
  const grid = document.getElementById('lesson-grid')

  const cards = LESSONS.map(lesson => `
    <div class="lesson-card bg-white border border-gray-200 rounded-xl p-5"
         onclick="location.href='planner.html?id=${lesson.id}'">
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
        <span class="text-xs text-gray-500 font-medium">${lesson.adjustmentCount} adjustments</span>
      </div>
    </div>
  `).join('')

  const addCard = `
    <div class="add-card">
      <div class="add-icon">+</div>
      <span class="add-label">Add new lesson</span>
    </div>
  `

  grid.innerHTML = cards + addCard
}

renderLessonCards()
