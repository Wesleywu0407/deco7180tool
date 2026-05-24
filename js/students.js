renderSidebar('students')

const profilesGrid = document.getElementById('profiles-grid')
const studentCount = document.getElementById('student-count')
const addStudentButton = document.getElementById('add-student-btn')
const studentModal = document.getElementById('student-modal')
const closeStudentModalButton = document.getElementById('close-student-modal')
const cancelStudentButton = document.getElementById('cancel-student')
const studentForm = document.getElementById('student-form')
const studentSearch = document.getElementById('student-search')
const studentDiagnosesInput = document.getElementById('student-diagnoses')
const needsPreview = document.getElementById('needs-preview')
const supportNeedPreview = document.getElementById('support-need-preview')
const studentFormError = document.getElementById('student-form-error')
const supportFocusOptions = document.getElementById('support-focus-options')
const studentModalLabel = studentModal.querySelector('.page-label')
const studentModalTitle = studentModal.querySelector('h2')
const studentModalDescription = studentModal.querySelector('h2 + p')
const studentSubmitButton = studentForm.querySelector('button[type="submit"]')
let editingStudentId = null
let selectedDiagnoses = []

const diagnosisMap = {
  Dyslexia: {
    tag: 'Reading support',
    description: 'Dyslexia — decoding is weaker than verbal comprehension. Reading-heavy tasks need visual alternatives.',
  },
  ASD: {
    tag: 'Routine support',
    description: 'ASD — benefits from predictable structure and advance notice of any changes to routine.',
  },
  ADHD: {
    tag: 'Attention support',
    description: 'ADHD — focus window is around 10 minutes. Movement breaks significantly improve engagement.',
  },
  'Physical disability': {
    tag: 'Access support',
    description: 'Physical disability — limited upper-limb mobility. Tech-assisted approaches work best.',
  },
  'Hearing impairment': {
    tag: 'Hearing support',
    description: 'Hearing impairment — wears hearing aids and relies on lip-reading and written support.',
  },
  'Communication delay': {
    tag: 'Communication support',
    description: 'Communication delay — benefits from extended processing time and clear step-by-step instructions.',
  },
  'Sensory processing disorder': {
    tag: 'Sensory support',
    description: 'Sensory processing differences — benefits from low-stimulus environment and movement breaks.',
  },
  'Social communication disorder': {
    tag: 'Social support',
    description: 'Social communication needs — benefits from structured group work and clear social expectations.',
  },
  'Anxiety disorder': {
    tag: 'Emotional support',
    description: 'Anxiety disorder — benefits from predictable routines and a calm check-in at lesson start.',
  },
  'Intellectual disability': {
    tag: 'Learning support',
    description: 'Intellectual disability — benefits from scaffolded tasks, visual instructions and extra time.',
  },
  'Other / Not specified': {
    tag: 'Learning support',
    description: 'Additional learning needs — teacher to add specific context in notes below.',
  },
}

const DIAGNOSIS_OPTIONS = Object.keys(diagnosisMap)

const DEFAULT_STRENGTHS = {
  maya: ['Strong verbal reasoning and logic', 'Responds well to visual worked examples'],
  liam: ['Responds well to predictable routines', 'Works well with clear structure'],
  bella: ['Enthusiastic contributor in group discussions', 'Strong verbal comprehension'],
  priya: ['Engages well in short interactive tasks', 'Responds well to movement breaks'],
  jack: ['Confident with technology-supported tasks', 'Works well when alternative response options are available'],
  sofia: ['Strong classroom participation when instructions are accessible', 'Benefits from written and visual support'],
}

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

function normaliseDiagnosis(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSupportTags(diagnoses) {
  return diagnoses
    .map((diagnosis) => diagnosisMap[diagnosis]?.tag)
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
}

function getSupportNeedText(diagnoses) {
  return diagnoses
    .map((diagnosis) => diagnosisMap[diagnosis]?.description)
    .filter(Boolean)
    .join(' ')
}

function diagnosesFromSupportTags(tags) {
  return tags
    .map((tag) => DIAGNOSIS_OPTIONS.find((diagnosis) => diagnosisMap[diagnosis].tag === tag))
    .filter(Boolean)
    .filter((diagnosis, index, list) => list.indexOf(diagnosis) === index)
}

function setSelectedDiagnoses(diagnoses) {
  const allowed = new Map(DIAGNOSIS_OPTIONS.map((option) => [option.toLowerCase(), option]))
  selectedDiagnoses = diagnoses
    .map((diagnosis) => allowed.get(String(diagnosis).trim().toLowerCase()) || normaliseDiagnosis(diagnosis))
    .filter((diagnosis) => diagnosisMap[diagnosis])
    .filter((diagnosis, index, list) => list.indexOf(diagnosis) === index)
  studentDiagnosesInput.value = selectedDiagnoses.join(', ')
  renderDiagnosisOptions()
  renderNeedsPreview(selectedDiagnoses)
}

function toggleDiagnosis(diagnosis) {
  const exists = selectedDiagnoses.includes(diagnosis)
  setSelectedDiagnoses(exists
    ? selectedDiagnoses.filter((item) => item !== diagnosis)
    : [...selectedDiagnoses, diagnosis])
}

function renderDiagnosisOptions() {
  supportFocusOptions.innerHTML = DIAGNOSIS_OPTIONS.map((option) => {
    const selected = selectedDiagnoses.includes(option)
    return `
      <button type="button"
        onclick="toggleDiagnosis('${escapeHtml(option)}')"
        aria-pressed="${selected ? 'true' : 'false'}"
        style="padding:7px 11px;border-radius:999px;border:1px solid ${selected ? '#A7F3D0' : '#D1D5DB'};
        background:${selected ? '#D1FAE5' : 'white'};color:${selected ? '#065F46' : '#374151'};
        font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">
        ${escapeHtml(option)}
      </button>
    `
  }).join('')
}

function openModal(studentId = null) {
  editingStudentId = studentId
  studentModal.classList.remove('hidden')
  studentModal.classList.add('flex')
  studentFormError.classList.add('hidden')

  if (editingStudentId) {
    const student = window.AdjustStore.getStudent(editingStudentId)
    if (!student) {
      editingStudentId = null
      closeModal()
      return
    }
    studentModalLabel.textContent = 'Edit student'
    studentModalTitle.textContent = 'Update student support profile'
    studentModalDescription.textContent = 'Keep this student profile current so lesson planning stays accurate across the app.'
    studentSubmitButton.textContent = 'Save changes'
    studentForm.elements.name.value = student.name
    studentForm.elements.year.value = student.year
    studentForm.elements.cls.value = student.classGroup || student.cls
    setSelectedDiagnoses(student.diagnoses || diagnosesFromSupportTags(student.supportTags || student.needs.map((need) => need.label)))
    studentForm.elements.notes.value = student.teacherNotes || student.notes
    studentForm.elements.strategies.value = (student.whatWorksWell || student.strategies).join('\n')
  } else {
    studentModalLabel.textContent = 'New student'
    studentModalTitle.textContent = 'Add student support profile'
    studentModalDescription.textContent = 'Capture the essentials so this student appears across profiles and lesson planning.'
    studentSubmitButton.textContent = 'Save student'
    studentForm.reset()
    studentForm.elements.year.value = 'Year 5'
    setSelectedDiagnoses([])
  }

  const modalCard = studentModal.querySelector('.surface-card')
  const nameInput = document.getElementById('student-name')
  requestAnimationFrame(() => {
    studentModal.scrollTop = 0
    if (modalCard) modalCard.scrollTop = 0
    try {
      nameInput.focus({ preventScroll: true })
    } catch (error) {
      nameInput.focus()
      studentModal.scrollTop = 0
      if (modalCard) modalCard.scrollTop = 0
    }
  })
}

function closeModal() {
  editingStudentId = null
  studentModal.classList.add('hidden')
  studentModal.classList.remove('flex')
}

function renderNeedsPreview(diagnoses) {
  const supportTags = getSupportTags(diagnoses)
  const description = getSupportNeedText(diagnoses)

  if (!diagnoses.length) {
    needsPreview.innerHTML = 'Choose one or more diagnoses.'
    needsPreview.className = 'text-xs text-gray-400'
    supportNeedPreview.textContent = ''
    return
  }

  needsPreview.className = 'flex flex-wrap gap-1.5'
  needsPreview.innerHTML = supportTags.map((tag) => {
    const styled = window.AdjustStore.styleNeed(tag)
    return `<span class="tag" style="background:${styled.bg};color:${styled.text}">${escapeHtml(styled.label)}</span>`
  }).join('')
  supportNeedPreview.textContent = description
}

function renderProfiles() {
  const searchValue = studentSearch.value.trim().toLowerCase()
  const students = window.AdjustStore.getStudents().filter((student) => {
    const diagnoses = student.diagnoses || diagnosesFromSupportTags(student.supportTags || student.needs.map((need) => need.label))
    const generatedSupportNeed = student.supportNeed || getSupportNeedText(diagnoses)
    if (!searchValue) return true
    return [
      student.name,
      student.year,
      student.classGroup || student.cls,
      generatedSupportNeed,
      student.teacherNotes || student.notes,
      ...(student.whatWorksWell || student.strategies),
      ...diagnoses,
      ...student.needs.map((need) => need.label),
    ].join(' ').toLowerCase().includes(searchValue)
  })

  const allStudents = window.AdjustStore.getStudents()
  studentCount.textContent = `${allStudents.length} students with support profiles in this class`

  profilesGrid.innerHTML = students.map((student) => {
    const diagnoses = student.diagnoses || diagnosesFromSupportTags(student.supportTags || student.needs.map((need) => need.label))
    const supportTags = student.supportTags || getSupportTags(diagnoses)
    const generatedSupportNeed = student.supportNeed || getSupportNeedText(diagnoses)
    const needTags = student.needs.map((need) =>
      `<span class="tag" style="background:${need.bg};color:${need.text}">${escapeHtml(need.label)}</span>`
    ).join('')

    const strategies = student.strategies.map((strategy) =>
      `<li class="flex items-start gap-2 text-sm text-gray-600">
        <span style="width:6px;height:6px;border-radius:9999px;background:#059669;flex-shrink:0;margin-top:8px;display:inline-block"></span>
        <span>${escapeHtml(strategy)}</span>
      </li>`
    ).join('')
    const strengths = (student.strengths?.length ? student.strengths : DEFAULT_STRENGTHS[student.id] || [])
      .map((strength) =>
        `<li class="flex items-start gap-2 text-sm text-gray-700">
          <span style="width:6px;height:6px;border-radius:9999px;background:#059669;flex-shrink:0;margin-top:8px;display:inline-block"></span>
          <span>${escapeHtml(strength)}</span>
        </li>`
      ).join('')

    return `
      <div class="surface-card surface-card-hover p-5 student-profile-card" data-student-id="${escapeHtml(student.id)}" data-student-name="${escapeHtml(student.name)}">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="avatar" style="width:44px;height:44px;font-size:13px;background:${student.avatarBg}">${student.initials}</div>
            <div>
              <p class="text-base font-semibold text-gray-900">${escapeHtml(student.name)}</p>
              <p style="font-size:13px;color:#6B7280;margin-top:4px">${escapeHtml(student.year)} · ${escapeHtml(student.classGroup || student.cls)}</p>
            </div>
          </div>
          <button type="button" onclick="openEditStudentModal('${student.id}')"
            style="padding:7px 12px;background:white;color:#374151;border:1px solid #E5E7EB;
            border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;
            transition:background 0.15s;flex-shrink:0"
            onmouseenter="this.style.background='#F9FAFB'"
            onmouseleave="this.style.background='white'">
            Edit
          </button>
        </div>

        <div>
          <div class="mb-4">
            <p class="page-label mb-2" style="color:#047857">Student strengths</p>
            <ul class="space-y-1.5">${strengths}</ul>
          </div>

          <div class="mb-4">
            <p class="page-label mb-2" style="color:#047857">Support need</p>
            <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">${escapeHtml(generatedSupportNeed)}</p>
          </div>

          <div class="mb-4">
            <p class="page-label mb-2" style="color:#9CA3AF;font-weight:500">Support focus</p>
            <div class="flex flex-wrap gap-1.5">${needTags}</div>
          </div>

          <div>
            <p class="page-label mb-2">What works in class</p>
            <ul class="space-y-1.5">${strategies}</ul>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #F3F4F6">
          <p style="font-size:11px;color:#9CA3AF;margin:0 0 10px">Last updated by teacher</p>
          <button
            onclick="window.location.href='planner.html'"
            style="width:100%;padding:9px 0;background:#059669;color:white;
            border:none;border-radius:10px;font-size:13px;font-weight:600;
            cursor:pointer;font-family:inherit;
            transition:background 0.15s"
            onmouseenter="this.style.background='#047857'"
            onmouseleave="this.style.background='#059669'">
            Plan lesson for this student →
          </button>
        </div>
      </div>
    `
  }).join('')
}

studentForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const formData = new FormData(studentForm)
  const name = String(formData.get('name') || '').trim()
  const year = String(formData.get('year') || '').trim()
  const cls = String(formData.get('cls') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const diagnoses = [...selectedDiagnoses]
  const supportTags = getSupportTags(diagnoses)
  const supportNeed = getSupportNeedText(diagnoses)
  const strategies = parseList(String(formData.get('strategies') || ''))

  if (!name || !year || !cls || !diagnoses.length) {
    studentFormError.textContent = 'Add the student name, year level, class group, and at least one diagnosis.'
    studentFormError.classList.remove('hidden')
    return
  }

  if (editingStudentId) {
    window.AdjustStore.updateStudent(editingStudentId, {
      name,
      year,
      classGroup: cls,
      diagnoses,
      supportTags,
      supportNeed,
      teacherNotes: notes,
      whatWorksWell: strategies,
    })
  } else {
    window.AdjustStore.saveStudent({
      name,
      year,
      classGroup: cls,
      diagnoses,
      supportTags,
      supportNeed,
      teacherNotes: notes,
      whatWorksWell: strategies,
    })
  }

  renderProfiles()
  renderSidebar('students')
  closeModal()
})

addStudentButton.addEventListener('click', () => openModal())
closeStudentModalButton.addEventListener('click', closeModal)
cancelStudentButton.addEventListener('click', closeModal)
studentModal.addEventListener('click', (event) => {
  if (event.target === studentModal) {
    closeModal()
  }
})
studentSearch.addEventListener('input', renderProfiles)

window.openEditStudentModal = openModal
window.toggleDiagnosis = toggleDiagnosis

renderProfiles()
