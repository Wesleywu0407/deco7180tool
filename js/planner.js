// ─── Lesson Planner page ──────────────────────────────────────────────────────

renderSidebar('lessons')

// ── Get lesson from URL param ──────────────────────────────────────────────────
const params = new URLSearchParams(location.search)
const lessonId = params.get('id') || 'math-fractions'
const lesson = LESSONS.find(l => l.id === lessonId) || LESSONS[0]

// ── State ──────────────────────────────────────────────────────────────────────
let selectedIds = [...lesson.studentIds]
let adjustments = JSON.parse(JSON.stringify(ADJUSTMENTS[lessonId] || ADJUSTMENTS['math-fractions']))

// ── Render lesson context ──────────────────────────────────────────────────────
function renderContext() {
  const pills = selectedIds.map(id => {
    const s = getStudent(id)
    if (!s) return ''
    return `
      <div class="flex items-center gap-1.5 px-3 py-1 border border-[#1D9E75] rounded-full">
        <div class="avatar" style="width:20px;height:20px;font-size:9px;background:${s.avatarBg}">${s.initials}</div>
        <span class="text-xs font-medium text-[#1D9E75]">${s.name}</span>
      </div>`
  }).join('')

  document.getElementById('lesson-context').innerHTML = `
    <!-- Lesson card -->
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
      <div class="flex flex-wrap gap-2" id="adjusting-for">
        ${selectedIds.length === 0
          ? '<p class="text-xs text-gray-400 italic">No students selected</p>'
          : pills}
      </div>
    </div>

    <button class="w-full flex items-center justify-center px-4 py-3 bg-[#1D9E75] text-white text-sm font-bold rounded-xl hover:bg-[#178a63] transition-colors tracking-wide">
      SAVE LESSON PLAN
    </button>
  `
}

// ── Render roster ──────────────────────────────────────────────────────────────
function renderRoster() {
  document.getElementById('roster').innerHTML = STUDENTS.map(s => {
    const sel = selectedIds.includes(s.id)
    const needTags = s.needs.map(n =>
      `<span class="tag" style="background:${n.bg};color:${n.text}">${n.label}</span>`
    ).join('')
    return `
      <div class="roster-card ${sel ? 'selected' : ''}" onclick="toggleStudent('${s.id}')">
        <div class="flex items-center gap-2.5">
          <div class="avatar" style="background:${s.avatarBg}">${s.initials}</div>
          <div class="min-w-0">
            <p class="roster-name text-sm font-semibold text-gray-800 truncate">${s.name}</p>
            <div class="flex flex-wrap gap-1 mt-0.5">${needTags}</div>
          </div>
        </div>
      </div>`
  }).join('')
}

// ── Render adjustments ─────────────────────────────────────────────────────────
function renderAdjustments() {
  const visible = adjustments.filter(a => selectedIds.includes(a.studentId))
  const list = document.getElementById('adjustments-list')
  const progressSection = document.getElementById('progress-section')

  if (visible.length === 0) {
    list.innerHTML = `<p class="text-xs text-gray-400 italic text-center mt-8">Select students from the roster to see suggested adjustments.</p>`
    progressSection.classList.add('hidden')
    return
  }

  list.innerHTML = visible.map(adj => `
    <div class="adj-card bg-white border border-gray-200 rounded-xl p-4 ${adj.checked ? 'checked' : ''}" id="adj-${adj.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <span class="tag" style="background:${adj.catBg};color:${adj.catText}">${adj.category}</span>
          <p class="text-xs font-semibold text-gray-700 mt-1 mb-1">${adj.studentName}</p>
          <p class="text-xs text-gray-600 leading-relaxed">${adj.description}</p>
        </div>
        <div class="checkbox-box ${adj.checked ? 'checked' : ''} mt-0.5" onclick="toggleAdjustment('${adj.id}')">
          ${adj.checked
            ? `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
            : ''}
        </div>
      </div>
    </div>
  `).join('')

  // Progress
  const checked = visible.filter(a => a.checked).length
  const total = visible.length
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100)
  progressSection.classList.remove('hidden')
  document.getElementById('progress-label').textContent = `${checked} / ${total} done`
  document.getElementById('progress-fill').style.width = pct + '%'
}

// ── Interactions ───────────────────────────────────────────────────────────────
function toggleStudent(id) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter(s => s !== id)
  } else {
    selectedIds.push(id)
  }
  renderRoster()
  renderContext()
  renderAdjustments()
}

function toggleAdjustment(id) {
  const adj = adjustments.find(a => a.id === id)
  if (adj) adj.checked = !adj.checked
  renderAdjustments()
}

// ── Init ───────────────────────────────────────────────────────────────────────
renderRoster()
renderContext()
renderAdjustments()
