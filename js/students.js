renderSidebar('students')

const profilesGrid = document.getElementById('profiles-grid')
const studentCount = document.getElementById('student-count')
const addStudentButton = document.getElementById('add-student-btn')
const studentModal = document.getElementById('student-modal')
const closeStudentModalButton = document.getElementById('close-student-modal')
const cancelStudentButton = document.getElementById('cancel-student')
const studentForm = document.getElementById('student-form')
const studentSearch = document.getElementById('student-search')
const studentNeedsInput = document.getElementById('student-needs')
const needsPreview = document.getElementById('needs-preview')
const studentFormError = document.getElementById('student-form-error')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function parseList(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function openModal() {
  studentModal.classList.remove('hidden')
  studentModal.classList.add('flex')
  studentForm.reset()
  studentFormError.classList.add('hidden')
  renderNeedsPreview([])
  document.getElementById('student-name').focus()
}

function closeModal() {
  studentModal.classList.add('hidden')
  studentModal.classList.remove('flex')
}

function renderNeedsPreview(tags) {
  if (!tags.length) {
    needsPreview.innerHTML = 'Add one or more tags such as Dyslexia, ASD, ADHD, Hearing.'
    needsPreview.className = 'text-xs text-gray-400 mt-2'
    return
  }

  needsPreview.className = 'flex flex-wrap gap-1.5 mt-2'
  needsPreview.innerHTML = tags.map((tag) => {
    const styled = window.AdjustStore.styleNeed(tag)
    return `<span class="tag" style="background:${styled.bg};color:${styled.text}">${styled.label}</span>`
  }).join('')
}

function renderProfiles() {
  const searchValue = studentSearch.value.trim().toLowerCase()
  const students = window.AdjustStore.getStudents().filter((student) => {
    if (!searchValue) return true
    return [
      student.name,
      student.year,
      student.cls,
      student.notes,
      ...student.needs.map((need) => need.label),
    ].join(' ').toLowerCase().includes(searchValue)
  })

  const allStudents = window.AdjustStore.getStudents()
  studentCount.textContent = `${allStudents.length} SEN students in this class`

  profilesGrid.innerHTML = students.map((student) => {
    const needTags = student.needs.map((need) =>
      `<span class="tag" style="background:${need.bg};color:${need.text}">${need.label}</span>`
    ).join('')

    const strategies = student.strategies.map((strategy) =>
      `<li class="flex items-start gap-2 text-sm text-gray-600">
        <span style="width:6px;height:6px;border-radius:9999px;background:#059669;flex-shrink:0;margin-top:8px;display:inline-block"></span>
        <span>${escapeHtml(strategy)}</span>
      </li>`
    ).join('')

    return `
      <div class="surface-card surface-card-hover p-5 student-profile-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="avatar" style="width:44px;height:44px;font-size:13px;background:${student.avatarBg}">${student.initials}</div>
          <div>
            <p class="text-base font-semibold text-gray-900">${escapeHtml(student.name)}</p>
            <p style="font-size:13px;color:#6B7280;margin-top:4px">${escapeHtml(student.year)} · ${escapeHtml(student.cls)}</p>
          </div>
        </div>

        <div class="mb-4">
          <p class="page-label mb-2">Learning needs</p>
          <div class="flex flex-wrap gap-1.5">${needTags}</div>
        </div>

        <div class="mb-4">
          <p class="page-label mb-2">Teacher notes</p>
          <p style="font-size:14px;line-height:1.6;color:#374151">${escapeHtml(student.notes)}</p>
        </div>

        <div>
          <p class="page-label mb-2">Common strategies</p>
          <ul class="space-y-1.5">${strategies}</ul>
        </div>
      </div>
    `
  }).join('')
}

studentNeedsInput.addEventListener('input', () => {
  renderNeedsPreview(parseList(studentNeedsInput.value))
})

studentForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const formData = new FormData(studentForm)
  const name = String(formData.get('name') || '').trim()
  const year = String(formData.get('year') || '').trim()
  const cls = String(formData.get('cls') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const needs = parseList(String(formData.get('needs') || ''))
  const strategies = parseList(String(formData.get('strategies') || ''))

  if (!name || !year || !cls || !needs.length) {
    studentFormError.textContent = 'Add the student name, year level, class group, and at least one learning need.'
    studentFormError.classList.remove('hidden')
    return
  }

  window.AdjustStore.saveStudent({
    name,
    year,
    cls,
    notes,
    needs,
    strategies,
  })

  renderProfiles()
  renderSidebar('students')
  closeModal()
})

addStudentButton.addEventListener('click', openModal)
closeStudentModalButton.addEventListener('click', closeModal)
cancelStudentButton.addEventListener('click', closeModal)
studentModal.addEventListener('click', (event) => {
  if (event.target === studentModal) {
    closeModal()
  }
})
studentSearch.addEventListener('input', renderProfiles)

renderProfiles()
