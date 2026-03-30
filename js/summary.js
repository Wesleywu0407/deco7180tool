renderSidebar('summary')

let selectedAdjustmentFilter = null
let selectedStudentIds = null
let selectedLessonSubjects = null
let openStudentId = null
let openLessonId = null
let focusedStudentId = null
let chartInstance = null
let insightAnimationTimer = null
let lastInsightSignature = ''

const NEED_ICONS = {
  blue: `<svg fill="none" stroke="#3B82F6" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  purple: `<svg fill="none" stroke="#7C3AED" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  amber: `<svg fill="none" stroke="#D97706" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  pink: `<svg fill="none" stroke="#EC4899" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/></svg>`,
  green: `<svg fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"/></svg>`,
  teal: `<svg fill="none" stroke="#14B8A6" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m9-9H3"/></svg>`,
}

const ICON_BG = { blue: '#DBEAFE', purple: '#EDE9FE', amber: '#FEF3C7', pink: '#FCE7F3', green: '#D1FAE5', teal: '#CCFBF1' }

function getAdjustmentTypeLabel(key) {
  return {
    Visual: 'Visual scaffolds',
    Participation: 'Participation support',
    Assessment: 'Assessment changes',
    Technology: 'Technology support',
  }[key] || 'Targeted support'
}

function getStudentAction(topPattern, studentName) {
  const firstName = studentName.split(' ')[0]
  if (topPattern === 'Visual') return `Continue diagram-based scaffolds and worked examples for ${firstName} next week.`
  if (topPattern === 'Participation') return `Keep structured turn-taking and supported participation routines in place for ${firstName}.`
  if (topPattern === 'Technology') return `Maintain tech-assisted response options and accessible tools for ${firstName}.`
  return `Pre-plan flexible assessment options for ${firstName} in upcoming lessons.`
}

function getMostDemandingLesson(metrics) {
  return [...metrics.lessonSummaries].sort((a, b) => b.count - a.count)[0] || null
}

function normalizeSelectionSet(selection, allValues) {
  if (selection === null) return null
  if (selection.size === 0) return new Set()
  if (selection.size === allValues.length) return null
  return selection
}

function toggleSelectionValue(currentSelection, value, allValues) {
  const nextSelection = currentSelection === null ? new Set(allValues) : new Set(currentSelection)
  if (nextSelection.has(value)) {
    nextSelection.delete(value)
  } else {
    nextSelection.add(value)
  }
  return normalizeSelectionSet(nextSelection, allValues)
}

function mapSuggestionCategory(category) {
  if (category === 'Materials') return 'Visual'
  if (category === 'Participation') return 'Participation'
  if (category === 'Assessment') return 'Assessment'
  if (category === 'Technology') return 'Technology'
  return 'Visual'
}

function getTopSupportStudent(metrics) {
  return [...metrics.stats].sort((a, b) => b.items - a.items)[0] || null
}

function getStudentInsightData(metrics, studentId) {
  const stat = metrics.stats.find((entry) => entry.studentId === studentId)
  const detail = metrics.studentLessonDetails[studentId]
  const student = detail?.student || window.AdjustStore.getStudent(studentId)
  if (!stat || !student || !detail) return null
  const topPattern = Object.entries(stat.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const impactedLessons = detail.impactedLessons
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((lesson) => `${lesson.title} (${lesson.count})`)
    .join(', ')
  return {
    student,
    stat,
    detail,
    topPattern,
    insight: `${student.name} needed support across ${stat.lessons} ${stat.lessons === 1 ? 'lesson' : 'lessons'}, with ${stat.items} adjustments overall.`,
    reason: `${getAdjustmentTypeLabel(topPattern)} appeared most often for ${student.name.split(' ')[0]}${impactedLessons ? `, especially in ${impactedLessons}.` : '.'}`,
    action: getStudentAction(topPattern, student.name),
  }
}

function getLessonInsightData(metrics, lessonId) {
  const entry = metrics.lessonSummaries.find((lesson) => lesson.lesson.id === lessonId)
  if (!entry) return null
  const topPattern = Object.entries(entry.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const impactedStudents = entry.scopedStudentIds
    .map((studentId) => window.AdjustStore.getStudent(studentId)?.name)
    .filter(Boolean)
    .join(', ')
  return {
    lesson: entry.lesson,
    entry,
    insight: `${entry.lesson.title} carried the heaviest support demand with ${entry.count} adjustments this week.`,
    reason: `${getAdjustmentTypeLabel(topPattern)} and related supports were most common${impactedStudents ? ` for ${impactedStudents}.` : '.'}`,
    action: `Prepare ${getAdjustmentTypeLabel(topPattern).toLowerCase()} in advance before teaching ${entry.lesson.title.toLowerCase()}.`,
  }
}

function getCategoryInsightData(metrics, categoryKey) {
  const total = metrics.totalsByType[categoryKey] || 0
  const relatedStudents = metrics.stats
    .filter((stat) => stat.breakdown[categoryKey] > 0)
    .sort((a, b) => b.breakdown[categoryKey] - a.breakdown[categoryKey])
    .slice(0, 2)
    .map((stat) => window.AdjustStore.getStudent(stat.studentId)?.name)
    .filter(Boolean)
  const relatedLessons = metrics.lessonSummaries
    .filter((entry) => entry.categories[categoryKey] > 0)
    .sort((a, b) => b.categories[categoryKey] - a.categories[categoryKey])
    .slice(0, 2)
    .map((entry) => entry.lesson.title)
  return {
    insight: `${getAdjustmentTypeLabel(categoryKey)} was used ${total} ${total === 1 ? 'time' : 'times'} across this week's support plans.`,
    reason: `${relatedStudents.length ? `${relatedStudents.join(' and ')} needed this support most often.` : 'This support pattern appeared across several students.'} ${relatedLessons.length ? `It was especially visible in ${relatedLessons.join(' and ')}.` : ''}`.trim(),
    action: `Prepare more ${getAdjustmentTypeLabel(categoryKey).toLowerCase()} for the next sequence of lessons.`,
  }
}

function getDefaultInsightData(metrics) {
  const mostCommon = Object.entries(metrics.totalsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const topLesson = getMostDemandingLesson(metrics)
  return {
    insight: `${getAdjustmentTypeLabel(mostCommon)} was the most common support pattern this week.`,
    reason: `Used across ${metrics.lessons.length} lessons, especially in maths and geometry planning${topLesson ? `, with ${topLesson.lesson.title} carrying the highest support load.` : '.'}`,
    action: `Prepare more ${getAdjustmentTypeLabel(mostCommon).toLowerCase()} for the next set of lessons and review the highest-demand lesson before planning.`,
  }
}

function getActiveInsightData(metrics) {
  if (focusedStudentId) {
    const focusedData = getStudentInsightData(metrics, focusedStudentId)
    if (focusedData) return focusedData
  }

  if (openStudentId) {
    const studentData = getStudentInsightData(metrics, openStudentId)
    if (studentData) return studentData
  }

  if (selectedStudentIds && selectedStudentIds.size === 1) {
    const [singleStudentId] = [...selectedStudentIds]
    const filteredStudentData = getStudentInsightData(metrics, singleStudentId)
    if (filteredStudentData) return filteredStudentData
  }

  if (selectedAdjustmentFilter) {
    return getCategoryInsightData(metrics, selectedAdjustmentFilter)
  }

  if (openLessonId) {
    const lessonData = getLessonInsightData(metrics, openLessonId)
    if (lessonData) return lessonData
  }

  return getDefaultInsightData(metrics)
}

function setInsightPanelContent(data) {
  document.getElementById('weekly-insight-text').textContent = data.insight
  document.getElementById('weekly-insight-reason').textContent = data.reason
  document.getElementById('weekly-insight-action').textContent = data.action
}

function applyInsightPanelState(metrics) {
  const panel = document.getElementById('weekly-insight-panel')
  const nextInsight = getActiveInsightData(metrics)
  const signature = JSON.stringify(nextInsight)

  if (!panel) return

  if (!lastInsightSignature) {
    setInsightPanelContent(nextInsight)
    lastInsightSignature = signature
    return
  }

  if (signature === lastInsightSignature) return

  clearTimeout(insightAnimationTimer)
  panel.classList.add('updating')
  insightAnimationTimer = window.setTimeout(() => {
    setInsightPanelContent(nextInsight)
    panel.classList.remove('updating')
    lastInsightSignature = signature
  }, 140)
}

function closeFocusMode() {
  focusedStudentId = null
  const overlay = document.getElementById('focus-overlay')
  const panel = document.getElementById('focus-panel')
  const summaryContent = document.getElementById('summary-content')

  summaryContent?.classList.remove('focus-mode-active')
  overlay?.classList.remove('visible')
  panel?.classList.remove('visible')

  window.setTimeout(() => {
    overlay?.classList.add('hidden')
    panel?.classList.add('hidden')
  }, 220)
}

function openFocusMode(metrics, studentId) {
  const data = getStudentInsightData(metrics, studentId)
  if (!data) return

  focusedStudentId = studentId
  openStudentId = studentId

  const overlay = document.getElementById('focus-overlay')
  const panel = document.getElementById('focus-panel')
  const summaryContent = document.getElementById('summary-content')
  const dominantCount = data.stat.breakdown[data.topPattern] || 0
  const patternRows = Object.entries(data.stat.breakdown)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])

  document.getElementById('focus-title').textContent = data.student.name
  document.getElementById('focus-subtitle').textContent = `${data.stat.items} adjustments across ${data.stat.lessons} ${data.stat.lessons === 1 ? 'lesson' : 'lessons'}`
  document.getElementById('focus-lessons').innerHTML = data.detail.impactedLessons.map((lesson) => `
    <div class="rounded-xl bg-[#f8faf8] px-3 py-2 flex items-center justify-between gap-3">
      <span class="text-sm text-gray-700">${lesson.title}</span>
      <span class="text-xs font-semibold text-gray-500">${lesson.count} adjustments</span>
    </div>
  `).join('')
  document.getElementById('focus-pattern').innerHTML = `
    <p class="text-sm text-gray-700 leading-relaxed">${getAdjustmentTypeLabel(data.topPattern)} was the strongest recurring pattern for ${data.student.name.split(' ')[0]}, appearing ${dominantCount} ${dominantCount === 1 ? 'time' : 'times'} across supported lesson moments.</p>
    <div class="space-y-2">
      ${patternRows.map(([key, value]) => `
        <div class="focus-pattern-row">
          <span class="text-sm text-gray-700">${getAdjustmentTypeLabel(key)}</span>
          <span class="text-xs font-semibold text-gray-500">${value}</span>
        </div>
      `).join('')}
    </div>
  `
  document.getElementById('focus-action').textContent = data.action

  overlay?.classList.remove('hidden')
  panel?.classList.remove('hidden')
  window.requestAnimationFrame(() => {
    summaryContent?.classList.add('focus-mode-active')
    overlay?.classList.add('visible')
    panel?.classList.add('visible')
  })
}

function getSummaryMetrics() {
  const allLessons = window.AdjustStore.getLessons()
  const allStudents = window.AdjustStore.getStudents()
  const allSubjects = [...new Set(allLessons.map((lesson) => lesson.subject))]
  const activeStudentIds = selectedStudentIds
  const activeLessonSubjects = selectedLessonSubjects

  const students = activeStudentIds === null
    ? allStudents
    : allStudents.filter((student) => activeStudentIds.has(student.id))

  const lessons = allLessons.filter((lesson) => {
    const matchesSubject = activeLessonSubjects === null || activeLessonSubjects.has(lesson.subject)
    const matchesStudent = activeStudentIds === null || lesson.studentIds.some((studentId) => activeStudentIds.has(studentId))
    return matchesSubject && matchesStudent
  })

  const lessonSummaries = lessons.map((lesson) => {
    const scopedStudentIds = lesson.studentIds.filter((studentId) => activeStudentIds === null || activeStudentIds.has(studentId))
    const suggestions = window.AdjustStore.generateAdjustmentSuggestions(lesson, scopedStudentIds)
    const categories = suggestions.reduce((accumulator, suggestion) => {
      const key = mapSuggestionCategory(suggestion.category)
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, { Visual: 0, Participation: 0, Assessment: 0, Technology: 0 })

    return {
      lesson,
      count: suggestions.length,
      suggestions,
      categories,
      scopedStudentIds,
    }
  })

  const rawStats = students.map((student) => {
    const lessonsForStudent = lessonSummaries.filter((entry) => entry.scopedStudentIds.includes(student.id))
    const breakdown = lessonsForStudent.reduce((totals, entry) => {
      const studentSuggestions = window.AdjustStore.generateAdjustmentSuggestions(entry.lesson, [student.id])
      studentSuggestions.forEach((suggestion) => {
        const key = mapSuggestionCategory(suggestion.category)
        totals[key] = (totals[key] || 0) + 1
      })
      return totals
    }, { Visual: 0, Assessment: 0, Participation: 0, Technology: 0 })

    const items = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
    return {
      studentId: student.id,
      items,
      lessons: lessonsForStudent.length,
      breakdown,
      barColor: student.avatarBg || '#1D9E75',
    }
  }).filter((stat) => stat.items > 0)

  const maxItems = rawStats.reduce((largest, stat) => Math.max(largest, stat.items), 0) || 1
  const stats = rawStats.map((stat) => ({
    ...stat,
    pct: Math.round((stat.items / maxItems) * 100),
  }))

  const studentLessonDetails = stats.reduce((accumulator, stat) => {
    const student = window.AdjustStore.getStudent(stat.studentId)
    const impactedLessons = lessonSummaries
      .filter((entry) => entry.scopedStudentIds.includes(stat.studentId))
      .map((entry) => {
        const studentSuggestions = window.AdjustStore.generateAdjustmentSuggestions(entry.lesson, [stat.studentId])
        return {
          title: entry.lesson.title,
          count: studentSuggestions.length,
          categories: studentSuggestions.reduce((total, suggestion) => {
            total[suggestion.category] = (total[suggestion.category] || 0) + 1
            return total
          }, {}),
        }
      })

    accumulator[stat.studentId] = {
      student,
      impactedLessons,
    }
    return accumulator
  }, {})

  const totalAdjustments = lessonSummaries.reduce((count, lesson) => count + lesson.count, 0)
  const visualSupportStudents = stats.filter((stat) => stat.breakdown.Visual >= 2).length

  const totalsByType = stats.reduce((accumulator, stat) => {
    Object.entries(stat.breakdown).forEach(([key, value]) => {
      accumulator[key] = (accumulator[key] || 0) + value
    })
    return accumulator
  }, { Visual: 0, Assessment: 0, Participation: 0, Technology: 0 })

  const topTypes = Object.entries(totalsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label.toLowerCase())

  return {
    lessons,
    students,
    stats,
    lessonSummaries,
    studentLessonDetails,
    totalAdjustments,
    visualSupportStudents,
    totalsByType,
    topTypes,
    allStudents,
    allSubjects,
  }
}

function renderSummaryFilters(metrics) {
  const adjustmentContainer = document.getElementById('summary-filter-adjustments')
  const studentContainer = document.getElementById('summary-filter-students')
  const lessonContainer = document.getElementById('summary-filter-lessons')

  const adjustmentRows = [
    { key: 'Visual', label: 'Visual scaffolds', value: metrics.totalsByType.Visual },
    { key: 'Participation', label: 'Participation', value: metrics.totalsByType.Participation },
    { key: 'Assessment', label: 'Assessment', value: metrics.totalsByType.Assessment },
    { key: 'Technology', label: 'Technology', value: metrics.totalsByType.Technology },
  ]

  adjustmentContainer.innerHTML = adjustmentRows.map((row) => `
    <button class="summary-filter-option ${selectedAdjustmentFilter === row.key ? 'active' : ''}" type="button" data-filter-key="${row.key}">
      <span class="summary-filter-bullet"></span>
      <span class="summary-filter-copy">${row.label} <strong>(${row.value})</strong></span>
    </button>
  `).join('')

  studentContainer.innerHTML = metrics.allStudents.map((student) => {
    const isChecked = selectedStudentIds === null || selectedStudentIds.has(student.id)
    return `
      <button class="summary-check-option ${isChecked ? 'active' : ''}" type="button" data-filter-student="${student.id}">
        <span class="summary-checkmark">${isChecked ? '&#10003;' : ''}</span>
        <span class="summary-filter-copy">${student.name.split(' ')[0]}</span>
      </button>
    `
  }).join('')

  lessonContainer.innerHTML = metrics.allSubjects.map((subject) => {
    const isChecked = selectedLessonSubjects === null || selectedLessonSubjects.has(subject)
    const label = subject === 'MATHEMATICS' ? 'Math' : subject === 'ENGLISH' ? 'English' : subject === 'SCIENCE' ? 'Science' : subject
    return `
      <button class="summary-check-option ${isChecked ? 'active' : ''}" type="button" data-filter-lesson="${subject}">
        <span class="summary-checkmark">${isChecked ? '&#10003;' : ''}</span>
        <span class="summary-filter-copy">${label}</span>
      </button>
    `
  }).join('')
}

function renderTopSupportStudents(metrics) {
  const container = document.getElementById('top-support-students')
  const topStudents = [...metrics.stats]
    .sort((a, b) => b.items - a.items)
    .slice(0, 3)

  container.className = 'priority-student-grid'
  container.innerHTML = topStudents.map((stat, index) => {
    const student = window.AdjustStore.getStudent(stat.studentId)
    const detail = metrics.studentLessonDetails[stat.studentId]
    if (!student) return ''
    const priorityClass = index === 0 ? 'priority-high' : index === 1 ? 'priority-medium' : 'priority-low'
    const sizeClass = index === 0 ? 'top' : index === 1 ? 'mid' : 'low'
    const topPattern = Object.entries(stat.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
    const topLesson = detail?.impactedLessons?.slice().sort((a, b) => b.count - a.count)[0]
    const matchesFilter = !selectedAdjustmentFilter || stat.breakdown[selectedAdjustmentFilter] > 0
    const isFocused = focusedStudentId === stat.studentId
    const insight = index === 0
      ? 'Highest support load this week'
      : index === 1
        ? 'Consistent support needed across lessons'
        : 'Monitor support pattern next week'

    return `
      <button type="button" class="priority-student-card ${sizeClass} ${matchesFilter ? 'active-filter' : 'filtered-out'} ${isFocused ? 'focused-student' : ''}" data-focus-student="${stat.studentId}">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-3">
              <span class="priority-indicator ${priorityClass}"></span>
              <span class="priority-chip">Top ${index + 1}</span>
            </div>
            <p class="text-base font-semibold text-gray-900">${student.name}</p>
            <p class="text-sm text-gray-500 mt-1">${stat.lessons} lessons impacted</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Adjustments</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">${stat.items}</p>
          </div>
        </div>
        <div class="mt-5 space-y-3">
          <div class="priority-student-metric">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Pattern</span>
            <span class="text-sm text-gray-700">${getAdjustmentTypeLabel(topPattern)}</span>
          </div>
          <div class="priority-student-metric">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Most affected lesson</span>
            <span class="text-sm text-gray-700">${topLesson ? `${topLesson.title} (${topLesson.count})` : 'No lesson data'}</span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">${insight}</p>
          <div class="pt-2">
            <span class="quick-action quick-action-visible">Focus student</span>
          </div>
        </div>
      </button>
    `
  }).join('')
}

function renderTopSupportLessons(metrics) {
  const container = document.getElementById('top-support-lessons')
  const lessons = metrics.lessonSummaries
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  container.innerHTML = lessons.map((entry, index) => `
    <div class="accordion-row lesson-expand-card ${!selectedAdjustmentFilter || entry.categories[selectedAdjustmentFilter] > 0 ? 'active-filter' : 'filtered-out'} ${openLessonId === entry.lesson.id ? 'selected-lesson' : ''}">
      <button class="accordion-trigger lesson-expand-trigger" type="button" data-lesson-row="${entry.lesson.id}" style="grid-template-columns:auto 1fr auto auto auto;">
        <span class="priority-chip">#${index + 1}</span>
        <div>
          <p class="text-sm font-semibold text-gray-900">${entry.lesson.title}</p>
          <p class="text-xs text-gray-500 mt-1">${entry.lesson.schedule}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Adjustments</p>
          <p class="text-sm text-gray-800 mt-1">${entry.count}</p>
        </div>
        <span class="quick-action">View details</span>
        <svg class="chevron ${openLessonId === entry.lesson.id ? 'open' : ''} w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 7 5 5 5-5"/>
        </svg>
      </button>
      <div class="accordion-detail ${openLessonId === entry.lesson.id ? 'open' : ''}">
        <div class="accordion-detail-inner">
          <div class="accordion-detail-body lesson-expand-body">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Students impacted</p>
                <div class="space-y-2">
                  ${entry.scopedStudentIds.map((studentId) => {
                    const student = window.AdjustStore.getStudent(studentId)
                    return `<div class="rounded-xl bg-[#f8faf8] px-3 py-2 text-sm text-gray-700">${student?.name || studentId}</div>`
                  }).join('')}
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Main issues</p>
                <p class="text-sm text-gray-700 leading-relaxed">${Object.entries(entry.categories).sort((a, b) => b[1] - a[1]).filter(([, value]) => value > 0).slice(0, 2).map(([label]) => `${label.toLowerCase()} support`).join(' and ') || 'General differentiated planning needs.'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Teaching action</p>
                <p class="text-sm text-gray-700 leading-relaxed">Preload targeted supports before teaching ${entry.lesson.title.toLowerCase()}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('')
}

function renderRepeatedSupportStudents(metrics) {
  const container = document.getElementById('repeated-support-students')
  const repeatedStudents = [...metrics.stats]
    .filter((stat) => stat.lessons >= 2)
    .sort((a, b) => b.lessons - a.lessons || b.items - a.items)

  if (!repeatedStudents.length) {
    container.innerHTML = `
      <div class="insight-list-item">
        <p class="text-sm text-gray-700 leading-relaxed">No students required support across multiple lessons this week.</p>
      </div>
    `
    return
  }

  container.innerHTML = repeatedStudents.map((stat) => {
    const student = window.AdjustStore.getStudent(stat.studentId)
    if (!student) return ''
    return `
      <div class="insight-list-item">
        <p class="text-sm font-semibold text-gray-900">${student.name} — support needed across ${stat.lessons} lessons</p>
      </div>
    `
  }).join('')
}

function renderAdjustmentBreakdown(metrics) {
  const container = document.getElementById('adjustment-type-breakdown')
  const rows = [
    { key: 'Visual', label: 'Visual scaffolds', value: metrics.totalsByType.Visual },
    { key: 'Participation', label: 'Participation support', value: metrics.totalsByType.Participation },
    { key: 'Assessment', label: 'Assessment changes', value: metrics.totalsByType.Assessment },
    { key: 'Technology', label: 'Technology support', value: metrics.totalsByType.Technology },
  ]

  container.innerHTML = rows.map((row) => `
    <button class="filter-pill ${selectedAdjustmentFilter === row.key ? 'active' : ''}" type="button" data-filter-key="${row.key}">
      <span class="text-sm text-gray-700">${row.label}</span>
      <div class="flex items-center gap-2">
        <span class="quick-action">Highlight</span>
        <span class="text-sm font-semibold text-gray-900">${row.value}</span>
      </div>
    </button>
  `).join('')
}

function renderRepeatedPatterns(metrics) {
  const container = document.getElementById('repeated-support-patterns')
  const visualLessonCount = metrics.lessons.filter((lesson) => {
    const suggestions = window.AdjustStore.generateAdjustmentSuggestions(lesson, lesson.studentIds)
    return suggestions.some((suggestion) => suggestion.category === 'Materials')
  }).length

  const recurringStudents = metrics.stats
    .filter((stat) => stat.lessons >= 2)
    .sort((a, b) => b.items - a.items)
    .slice(0, 2)
    .map((stat) => window.AdjustStore.getStudent(stat.studentId)?.name)
    .filter(Boolean)

  const sofia = metrics.stats.find((stat) => stat.studentId === 'sofia')
  const patterns = [
    `Visual scaffolds were used in ${visualLessonCount} out of ${metrics.lessons.length} lessons.`,
    recurringStudents.length ? `${recurringStudents.join(' and ')} required repeated support across multiple lessons.` : 'Support patterns were spread evenly across students this week.',
    sofia ? `Sofia required hearing-related support in ${sofia.lessons} ${sofia.lessons === 1 ? 'lesson' : 'lessons'}.` : 'Hearing-related support was not recorded this week.',
  ]

  container.innerHTML = patterns.map((pattern) => `
    <div class="insight-list-item" style="background:rgba(255,255,255,0.7);border-color:#dbece5;">
      <p class="text-sm text-gray-700 leading-relaxed">${pattern}</p>
    </div>
  `).join('')
}

function renderNextWeekActions(metrics) {
  const container = document.getElementById('next-week-actions')
  const mostCommonType = Object.entries(metrics.totalsByType)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const typeLabels = {
    Visual: 'visual scaffolds',
    Participation: 'participation support',
    Assessment: 'assessment adjustments',
    Technology: 'technology support',
  }

  const mostDemandingLesson = metrics.lessons
    .map((lesson) => ({
      lesson,
      count: window.AdjustStore.lessonAdjustmentCount(lesson, metrics.students),
    }))
    .sort((a, b) => b.count - a.count)[0]

  const repeatedStudent = [...metrics.stats]
    .filter((stat) => stat.lessons >= 2)
    .sort((a, b) => b.lessons - a.lessons || b.items - a.items)[0]

  const repeatedStudentName = repeatedStudent
    ? window.AdjustStore.getStudent(repeatedStudent.studentId)?.name
    : null

  const actions = [
    `Prepare more ${typeLabels[mostCommonType] || 'targeted support'} for upcoming lessons.`,
    mostDemandingLesson
      ? `Provide additional support for ${mostDemandingLesson.lesson.title.toLowerCase()}.`
      : 'Provide additional support for the most adjustment-heavy lesson next week.',
    repeatedStudentName
      ? `Continue consistent support strategies for ${repeatedStudentName}.`
      : 'Continue consistent support strategies for students appearing across multiple lessons.',
  ].slice(0, 3)

  container.innerHTML = actions.map((action, index) => `
    <div class="insight-list-item" style="background:rgba(255,255,255,0.74);border-color:#dbece5;">
      <p class="insight-kicker">Action ${index + 1}</p>
      <p class="text-sm text-gray-700 leading-relaxed">${action}</p>
    </div>
  `).join('')
}

function renderStatCards() {
  const metrics = getSummaryMetrics()
  const highestSupportStudent = [...metrics.stats].sort((a, b) => b.items - a.items)[0]
  const highestSupportName = highestSupportStudent ? window.AdjustStore.getStudent(highestSupportStudent.studentId)?.name : 'No data'
  const mostDemandingLesson = metrics.lessons
    .map((lesson) => ({
      lesson,
      count: window.AdjustStore.lessonAdjustmentCount(lesson, metrics.students),
    }))
    .sort((a, b) => b.count - a.count)[0]
  const cards = [
    {
      number: String(metrics.lessons.length),
      label: 'Lessons this week',
      insight: '+1 from last week, with geometry carrying the heaviest support load.',
    },
    {
      number: String(metrics.students.length),
      label: 'SEN students',
      insight: `${metrics.visualSupportStudents} students needed repeated visual support across multiple lessons.`,
    },
    {
      number: String(metrics.totalAdjustments),
      label: 'Total adjustments',
      insight: `${highestSupportName || 'One student'} carried the highest support load, while ${mostDemandingLesson?.lesson.title.split(':')[0] || 'one lesson'} drove the biggest planning demand.`,
    },
  ]

  document.getElementById('stat-cards').innerHTML = cards.map((card) => `
    <div class="summary-card rounded-xl p-6 flex flex-col items-start" style="background:#F5F5F0">
      <span class="text-4xl font-bold leading-none mb-2" style="color:#1D9E75">${card.number}</span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">${card.label}</span>
      <p class="text-sm text-gray-600 mt-3 leading-relaxed">${card.insight}</p>
      <div class="mt-4">
        <span class="quick-action">View details</span>
      </div>
    </div>
  `).join('')
}

function renderSummaryHero(metrics) {
  const hero = document.getElementById('summary-hero')
  const topStudent = [...metrics.stats].sort((a, b) => b.items - a.items)[0]
  const topStudentName = topStudent ? window.AdjustStore.getStudent(topStudent.studentId)?.name : 'No student'
  const topLesson = metrics.lessons
    .map((lesson) => ({
      lesson,
      count: window.AdjustStore.lessonAdjustmentCount(lesson, metrics.students),
    }))
    .sort((a, b) => b.count - a.count)[0]

  hero.innerHTML = `
    <div class="grid grid-cols-[1.6fr_1fr] gap-5 items-start">
      <div>
        <p class="page-label mb-3">This week's key insight</p>
        <h2 class="text-2xl font-semibold text-gray-900 leading-tight">Visual scaffolds were the most common support pattern this week.</h2>
        <p class="text-sm text-gray-600 mt-3 leading-relaxed">Used across ${metrics.lessons.length} lessons, especially in maths and geometry planning.</p>
      </div>
      <div class="grid gap-3">
        <div class="hero-highlight">
          <p class="page-label mb-2">Highest support load</p>
          <p class="text-sm font-semibold text-gray-900">${topStudentName || 'No student'} · ${topStudent?.items || 0} adjustments</p>
          <div class="mt-3">
            <span class="quick-action">Focus student</span>
          </div>
        </div>
        <div class="hero-highlight">
          <p class="page-label mb-2">Most demanding lesson</p>
          <p class="text-sm font-semibold text-gray-900">${topLesson?.lesson.title.split(':')[0] || 'No lesson'} · ${topLesson?.count || 0} adjustments</p>
          <div class="mt-3">
            <span class="quick-action">View details</span>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderWeeklyInsightBanner(metrics) {
  applyInsightPanelState(metrics)
}

function formatBreakdown(breakdown) {
  return [
    `Visual: ${breakdown.Visual}`,
    `Assessment: ${breakdown.Assessment}`,
    `Participation: ${breakdown.Participation}`,
    `Technology: ${breakdown.Technology}`,
  ].join(' · ')
}

function renderStudentRows() {
  const metrics = getSummaryMetrics()
  const stats = metrics.stats

  document.getElementById('student-rows').innerHTML = stats.map((stat) => {
    const student = window.AdjustStore.getStudent(stat.studentId)
    if (!student) return ''
    const matchesFilter = !selectedAdjustmentFilter || stat.breakdown[selectedAdjustmentFilter] > 0
    const isFocused = focusedStudentId === stat.studentId

    const needTags = student.needs.map((need) =>
      `<span class="tag" style="background:${need.bg};color:${need.text}">${need.label}</span>`
    ).join('')

    const breakdownText = formatBreakdown(stat.breakdown)

    return `
      <button type="button" class="summary-row ${matchesFilter ? 'active-filter' : 'filtered-out'} ${isFocused ? 'focused-student' : ''} bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4" data-focus-student="${stat.studentId}" title="${breakdownText}">
        <div class="flex items-center gap-3" style="width:208px;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:9999px;background:${ICON_BG[student.color] || ICON_BG.green};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${NEED_ICONS[student.color] || NEED_ICONS.green}
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${student.name}</p>
            <div class="flex flex-wrap gap-1 mt-0.5">${needTags}</div>
          </div>
        </div>
        <div style="width:144px;flex-shrink:0">
          <p class="text-sm text-gray-500">
            ${stat.items} items · ${stat.lessons} ${stat.lessons === 1 ? 'lesson' : 'lessons'}
          </p>
          <p class="summary-breakdown text-[11px] text-gray-400 mt-1">Coverage reflects this week's adjustment mix.</p>
        </div>
        <div class="flex flex-1 items-center gap-3">
          <div style="flex:1">
            <div style="height:8px;background:#e5e7eb;border-radius:9999px;overflow:hidden">
              <div style="height:100%;width:${stat.pct}%;background:${stat.barColor};border-radius:9999px"></div>
            </div>
            <p class="summary-breakdown text-[11px] text-gray-500 mt-2">${breakdownText}</p>
          </div>
          <span class="text-xs text-gray-500 font-medium" style="width:52px;text-align:right">${stat.pct}%</span>
        </div>
      </button>
    `
  }).join('')
}

function renderChartInsight(metrics) {
  const [first, second] = metrics.topTypes
  document.getElementById('chart-insight').textContent =
    `${first[0].toUpperCase() + first.slice(1)} scaffolds and ${second} support were the most common adjustment patterns this week.`
}

function renderChart() {
  const metrics = getSummaryMetrics()
  renderChartInsight(metrics)
  const categoryOrder = ['Visual', 'Assessment', 'Participation', 'Technology']
  const selectedIndex = selectedAdjustmentFilter ? categoryOrder.indexOf(selectedAdjustmentFilter) : -1
  const canvas = document.getElementById('adj-chart')

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = canvas.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categoryOrder,
      datasets: metrics.stats.slice(0, 4).map((stat) => {
        const student = window.AdjustStore.getStudent(stat.studentId)
        const baseColor = student?.avatarBg || '#1D9E75'
        return {
          label: student?.name || stat.studentId,
          data: [
            stat.breakdown.Visual,
            stat.breakdown.Assessment,
            stat.breakdown.Participation,
            stat.breakdown.Technology,
          ],
          backgroundColor: categoryOrder.map((_, index) => {
            if (selectedIndex === -1) return baseColor
            return index === selectedIndex ? baseColor : `${baseColor}55`
          }),
          borderRadius: 3,
          borderSkipped: false,
        }
      }),
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 11, weight: 600 },
            color: '#4b5563',
            usePointStyle: true,
            pointStyleWidth: 8,
            padding: 18,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17,24,39,0.92)',
          padding: 12,
          displayColors: true,
          titleFont: { size: 12, weight: 700 },
          bodyFont: { size: 12 },
          callbacks: {
            title(items) {
              return getAdjustmentTypeLabel(items[0].label)
            },
            label(context) {
              return `${context.dataset.label} - ${context.raw} adjustment${context.raw === 1 ? '' : 's'}`
            },
            afterBody(items) {
              const total = items.reduce((sum, item) => sum + item.raw, 0)
              return [`Total in this category: ${total}`, 'Click to filter the dashboard']
            },
          },
        },
      },
      animation: {
        duration: 420,
        easing: 'easeOutCubic',
      },
      transitions: {
        active: {
          animation: {
            duration: 220,
          },
        },
      },
      onHover(event, activeElements) {
        event.native.target.style.cursor = activeElements.length ? 'pointer' : 'default'
      },
      onClick(event, activeElements, chart) {
        if (!activeElements.length) return

        const activePoint = activeElements[0]
        const categoryKey = chart.data.labels[activePoint.index]
        const clickedStudent = metrics.stats[activePoint.datasetIndex]
        const clickedStudentId = clickedStudent?.studentId

        const sameStudentSelection = selectedStudentIds && clickedStudentId
          ? selectedStudentIds.size === 1 && selectedStudentIds.has(clickedStudentId)
          : false

        if (selectedAdjustmentFilter === categoryKey && sameStudentSelection) {
          selectedAdjustmentFilter = null
          selectedStudentIds = null
        } else {
          selectedAdjustmentFilter = categoryKey
          selectedStudentIds = clickedStudentId ? new Set([clickedStudentId]) : selectedStudentIds
        }

        if (focusedStudentId && clickedStudentId && focusedStudentId !== clickedStudentId) {
          closeFocusMode()
        }

        if (clickedStudentId) {
          openStudentId = clickedStudentId
        }

        renderSummaryPage()
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6b7280' },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 11 }, color: '#6b7280', stepSize: 1 },
          border: { display: false },
        },
      },
    },
  })
}

document.getElementById('geometry-unit-btn')?.addEventListener('click', () => {
  location.href = 'planner.html?id=geometry-unit'
})

document.getElementById('export-report-btn')?.addEventListener('click', () => {
  location.href = 'report.html?week=9'
})

function renderSummaryPage() {
  const metrics = getSummaryMetrics()
  const availableStudentIds = new Set(metrics.stats.map((stat) => stat.studentId))
  const availableLessonIds = new Set(metrics.lessonSummaries.map((entry) => entry.lesson.id))

  if (focusedStudentId && !availableStudentIds.has(focusedStudentId)) {
    closeFocusMode()
  }
  if (openStudentId && !availableStudentIds.has(openStudentId)) {
    openStudentId = null
  }
  if (openLessonId && !availableLessonIds.has(openLessonId)) {
    openLessonId = null
  }

  renderSummaryHero(metrics)
  renderStatCards()
  renderWeeklyInsightBanner(metrics)
  renderSummaryFilters(metrics)
  renderTopSupportStudents(metrics)
  renderTopSupportLessons(metrics)
  renderRepeatedSupportStudents(metrics)
  renderStudentRows()
  renderChart()
  renderAdjustmentBreakdown(metrics)
  renderRepeatedPatterns(metrics)
  renderNextWeekActions(metrics)
}

renderSummaryPage()

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter-key]')
  const studentFilter = event.target.closest('[data-filter-student]')
  const lessonFilter = event.target.closest('[data-filter-lesson]')
  const studentRow = event.target.closest('[data-student-row]')
  const lessonRow = event.target.closest('[data-lesson-row]')
  const focusStudent = event.target.closest('[data-focus-student]')
  const closeFocus = event.target.closest('#close-focus-panel')
  const focusOverlay = event.target.closest('#focus-overlay')

  if (closeFocus || focusOverlay) {
    closeFocusMode()
    renderSummaryPage()
    return
  }

  if (filter) {
    const key = filter.getAttribute('data-filter-key')
    selectedAdjustmentFilter = selectedAdjustmentFilter === key ? null : key
    renderSummaryPage()
    return
  }

  if (studentFilter) {
    const id = studentFilter.getAttribute('data-filter-student')
    const allStudentIds = window.AdjustStore.getStudents().map((student) => student.id)
    selectedStudentIds = toggleSelectionValue(selectedStudentIds, id, allStudentIds)
    renderSummaryPage()
    return
  }

  if (lessonFilter) {
    const subject = lessonFilter.getAttribute('data-filter-lesson')
    const allSubjects = [...new Set(window.AdjustStore.getLessons().map((lesson) => lesson.subject))]
    selectedLessonSubjects = toggleSelectionValue(selectedLessonSubjects, subject, allSubjects)
    renderSummaryPage()
    return
  }

  if (focusStudent) {
    const id = focusStudent.getAttribute('data-focus-student')
    const metrics = getSummaryMetrics()
    if (focusedStudentId === id) {
      closeFocusMode()
    } else {
      openFocusMode(metrics, id)
    }
    renderSummaryPage()
    return
  }

  if (studentRow) {
    const id = studentRow.getAttribute('data-student-row')
    openStudentId = openStudentId === id ? null : id
    renderSummaryPage()
    return
  }

  if (lessonRow) {
    const id = lessonRow.getAttribute('data-lesson-row')
    openLessonId = openLessonId === id ? null : id
    renderSummaryPage()
  }
})
