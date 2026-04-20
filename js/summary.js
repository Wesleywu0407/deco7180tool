renderSidebar('summary')

// ── Category mapping ──────────────────────────────────────────────────────────
function mapCategory(category) {
  if (category === 'Materials') return 'Visual'
  if (category === 'Participation') return 'Participation'
  if (category === 'Assessment') return 'Assessment'
  if (category === 'Technology') return 'Technology'
  return 'Visual'
}

function getAdjTypeLabel(key) {
  return {
    Visual: 'Visual scaffolds',
    Participation: 'Participation support',
    Assessment: 'Assessment changes',
    Technology: 'Technology support',
  }[key] || key
}

// ── Metrics computation ───────────────────────────────────────────────────────
function getSummaryMetrics() {
  const allLessons = window.AdjustStore.getLessons()
  const allStudents = window.AdjustStore.getStudents()

  // Per-lesson summaries
  const lessonSummaries = allLessons.map((lesson) => {
    const suggestions = window.AdjustStore.generateAdjustmentSuggestions(lesson, lesson.studentIds)
    const categories = suggestions.reduce((acc, s) => {
      const key = mapCategory(s.category)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, { Visual: 0, Participation: 0, Assessment: 0, Technology: 0 })
    return { lesson, count: suggestions.length, categories, studentIds: lesson.studentIds }
  })

  // Per-student stats
  const rawStats = allStudents.map((student) => {
    const lessonsForStudent = lessonSummaries.filter((e) => e.studentIds.includes(student.id))
    const breakdown = { Visual: 0, Participation: 0, Assessment: 0, Technology: 0 }
    lessonsForStudent.forEach((entry) => {
      const suggs = window.AdjustStore.generateAdjustmentSuggestions(entry.lesson, [student.id])
      suggs.forEach((s) => {
        const key = mapCategory(s.category)
        breakdown[key] = (breakdown[key] || 0) + 1
      })
    })
    const items = Object.values(breakdown).reduce((a, b) => a + b, 0)
    return {
      studentId: student.id,
      items,
      lessons: lessonsForStudent.length,
      breakdown,
      barColor: student.avatarBg || '#1D9E75',
    }
  }).filter((s) => s.items > 0)

  const maxItems = rawStats.reduce((max, s) => Math.max(max, s.items), 1)
  const stats = rawStats.map((s) => ({ ...s, pct: Math.round((s.items / maxItems) * 100) }))

  // Totals by type
  const totalsByType = { Visual: 0, Participation: 0, Assessment: 0, Technology: 0 }
  stats.forEach((stat) => {
    Object.entries(stat.breakdown).forEach(([key, val]) => {
      totalsByType[key] = (totalsByType[key] || 0) + val
    })
  })

  const totalAdjustments = lessonSummaries.reduce((sum, e) => sum + e.count, 0)

  return {
    lessons: allLessons,
    students: allStudents,
    lessonSummaries,
    stats,
    totalAdjustments,
    totalsByType,
  }
}

// ── Section A: Stats cards ────────────────────────────────────────────────────
function renderStats(metrics) {
  const cards = [
    { num: metrics.lessons.length, label: 'Lessons this week' },
    { num: metrics.students.length, label: 'SEN students' },
    { num: metrics.totalAdjustments, label: 'Total adjustments' },
  ]

  document.getElementById('section-stats').innerHTML = cards.map((c) => `
    <div style="background:white;border:1px solid #E5E7EB;border-radius:12px;padding:20px">
      <div style="font-size:32px;font-weight:700;color:#1D9E75;line-height:1;margin-bottom:8px">${c.num}</div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF">${c.label}</div>
    </div>
  `).join('')
}

// ── Section B: AI Summary ─────────────────────────────────────────────────────
function renderAISummary(metrics) {
  const topType = Object.entries(metrics.totalsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const topLesson = [...metrics.lessonSummaries].sort((a, b) => b.count - a.count)[0]
  const lessonCount = metrics.lessons.length

  const insight = `${getAdjTypeLabel(topType)} was the most common support pattern this week.`
  const reason = `Used across ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}${topLesson ? `, especially in ${topLesson.lesson.subject.toLowerCase()} planning` : ''}${topLesson ? `, with "${topLesson.lesson.title}" carrying the highest support load.` : '.'}`
  const action = `Prepare more ${getAdjTypeLabel(topType).toLowerCase()} for next week's lessons and review the highest-demand lesson before planning.`

  const subCards = [
    { label: 'PATTERN', text: insight },
    { label: 'REASON', text: reason },
    { label: 'ACTION', text: action },
  ]

  document.getElementById('section-ai').innerHTML = `
    <div style="margin-bottom:6px">
      <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#6B7280">
        AI Summary
      </span>
    </div>
    <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0 0 16px">
      Live teaching recommendation
    </h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      ${subCards.map((c) => `
        <div style="
          background:rgba(255,255,255,0.75);
          border:1px solid #BBF7D0;
          border-radius:10px;
          padding:14px;
        ">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#6B7280;margin:0 0 8px">
            ${c.label}
          </p>
          <p style="font-size:13px;color:#374151;line-height:1.6;margin:0">
            ${c.text}
          </p>
        </div>
      `).join('')}
    </div>
  `
}

// ── Section C: Adjustments per student ───────────────────────────────────────
function renderStudentRows(metrics) {
  const sorted = [...metrics.stats].sort((a, b) => b.items - a.items)

  document.getElementById('section-students').innerHTML = sorted.map((stat) => {
    const student = window.AdjustStore.getStudent(stat.studentId)
    if (!student) return ''

    const needTags = student.needs.map((n) => `
      <span style="
        display:inline-flex; align-items:center;
        padding:1px 8px; border-radius:4px;
        font-size:10px; font-weight:700;
        text-transform:uppercase; letter-spacing:0.05em;
        background:${n.bg}; color:${n.text};
      ">${n.label}</span>
    `).join('')

    return `
      <div style="
        display:flex; align-items:center; gap:16px;
        background:white; border:1px solid #E5E7EB;
        border-radius:10px; padding:14px;
      ">
        <!-- Avatar + Name + Need tags -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;width:220px">
          <div style="
            width:36px; height:36px; border-radius:9999px;
            background:${student.avatarBg};
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0; font-size:12px; font-weight:700; color:white;
          ">${student.initials}</div>
          <div>
            <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:4px">${student.name}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">${needTags}</div>
          </div>
        </div>

        <!-- Item · lesson count — never truncate -->
        <div style="flex-shrink:0;width:150px">
          <span style="font-size:13px;color:#6B7280;white-space:nowrap">
            ${stat.items} items · ${stat.lessons} ${stat.lessons === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>

        <!-- Bar (200px) + percentage label -->
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
          <div style="
            width:200px; flex-shrink:0;
            height:8px; background:#E5E7EB;
            border-radius:9999px; overflow:hidden;
          ">
            <div style="
              height:100%; width:${stat.pct}%;
              background:${student.avatarBg};
              border-radius:9999px;
            "></div>
          </div>
          <span style="font-size:12px;color:#6B7280;font-weight:500;white-space:nowrap">
            ${stat.pct}%
          </span>
        </div>
      </div>
    `
  }).join('')
}

// ── Section D: Most demanding lessons ────────────────────────────────────────
const RANK_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#9CA3AF']

function renderDemandingLessons(metrics) {
  const sorted = [...metrics.lessonSummaries].sort((a, b) => b.count - a.count).slice(0, 4)

  document.getElementById('section-lessons').innerHTML = sorted.map((entry, i) => `
    <div style="
      display:flex; align-items:center; justify-content:space-between;
      background:white; border:1px solid #E5E7EB;
      border-radius:10px; padding:14px;
    ">
      <!-- Rank + title + subtitle -->
      <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
        <div style="
          width:28px; height:28px; border-radius:9999px;
          background:${RANK_COLORS[i] || '#9CA3AF'};
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; font-size:12px; font-weight:700; color:white;
        ">${i + 1}</div>
        <div style="min-width:0">
          <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:2px">
            ${entry.lesson.title}
          </div>
          <div style="font-size:12px;color:#9CA3AF">
            ${entry.lesson.subject} · ${entry.lesson.schedule}
          </div>
        </div>
      </div>
      <!-- Adjustment count -->
      <div style="flex-shrink:0;text-align:right;margin-left:16px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;margin-bottom:2px">
          Adjustments
        </div>
        <div style="font-size:18px;font-weight:700;color:#111827">${entry.count}</div>
      </div>
    </div>
  `).join('')
}

// ── Section E: Support patterns ───────────────────────────────────────────────
const PATTERN_CONFIG = [
  { key: 'Visual',        label: 'Visual scaffolds',      color: '#1D9E75', badgeBg: '#D1FAE5', badgeText: '#065F46' },
  { key: 'Participation', label: 'Participation',          color: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#92400E' },
  { key: 'Assessment',    label: 'Assessment',             color: '#7C3AED', badgeBg: '#EDE9FE', badgeText: '#5B21B6' },
  { key: 'Technology',    label: 'Technology',             color: '#3B82F6', badgeBg: '#DBEAFE', badgeText: '#1D4ED8' },
]

function renderSupportPatterns(metrics) {
  const maxVal = Math.max(...Object.values(metrics.totalsByType), 1)

  document.getElementById('section-patterns').innerHTML = PATTERN_CONFIG.map((p) => {
    const val = metrics.totalsByType[p.key] || 0
    const pct = Math.round((val / maxVal) * 100)

    return `
      <div style="display:flex;align-items:center;gap:12px">
        <!-- Coloured dot -->
        <div style="
          width:10px; height:10px; border-radius:9999px;
          background:${p.color}; flex-shrink:0;
        "></div>

        <!-- Type name -->
        <span style="font-size:13px;color:#374151;width:156px;flex-shrink:0">
          ${p.label}
        </span>

        <!-- Count badge -->
        <div style="
          display:inline-flex; align-items:center; justify-content:center;
          padding:2px 8px; border-radius:4px; flex-shrink:0;
          background:${p.badgeBg}; min-width:28px;
        ">
          <span style="font-size:11px;font-weight:700;color:${p.badgeText}">${val}</span>
        </div>

        <!-- Proportion bar -->
        <div style="flex:1;height:8px;background:#F3F4F6;border-radius:9999px;overflow:hidden">
          <div style="
            height:100%; width:${pct}%;
            background:${p.color}; border-radius:9999px;
            transition:width 0.4s ease;
          "></div>
        </div>
      </div>
    `
  }).join('')
}

// ── Focus mode (kept for compatibility) ──────────────────────────────────────
function closeFocusMode() {
  const overlay = document.getElementById('focus-overlay')
  const panel = document.getElementById('focus-panel')
  overlay?.classList.remove('visible')
  panel?.classList.remove('visible')
  window.setTimeout(() => {
    overlay?.classList.add('hidden')
    panel?.classList.add('hidden')
  }, 220)
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderSummaryPage() {
  const metrics = getSummaryMetrics()
  renderStats(metrics)
  renderAISummary(metrics)
  renderStudentRows(metrics)
  renderDemandingLessons(metrics)
  renderSupportPatterns(metrics)
}

renderSummaryPage()

// ── Global click handler (close focus panel if open) ─────────────────────────
document.addEventListener('click', (event) => {
  const closeFocus = event.target.closest('#close-focus-panel')
  const focusOverlay = event.target.closest('#focus-overlay')
  if (closeFocus || focusOverlay) {
    closeFocusMode()
  }
})
