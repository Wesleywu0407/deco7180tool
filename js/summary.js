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

const expandedStudentIds = new Set()

function sparklineSvg(values, color) {
  const width = 240
  const height = 32
  const padding = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const points = values.map((value, index) => {
    const x = padding + step * index
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return `
    <svg width="100%" height="32" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true" style="display:block;margin:10px 0 10px">
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `
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
      barColor: student.avatarBg || '#059669',
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
    {
      num: 4,
      label: 'Lessons this week',
      accent: '#059669',
      iconBg: '#D1FAE5',
      iconStroke: '#059669',
      delta: '+1 from last week',
      deltaColor: '#059669',
      sparkline: [2, 3, 2, 4],
      icon: `
        <svg width="18" height="18" fill="none" stroke="#059669" stroke-width="1.9" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 6.75h8M8 11.25h8M8 15.75h5.5"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 4.75h10.5A1.75 1.75 0 0 1 19 6.5v11A1.75 1.75 0 0 1 17.25 19H6.75A1.75 1.75 0 0 1 5 17.5v-11A1.75 1.75 0 0 1 6.75 4.75Z"/>
        </svg>
      `,
    },
    {
      num: 6,
      label: 'SEN students',
      accent: '#7C3AED',
      iconBg: '#EDE9FE',
      iconStroke: '#7C3AED',
      delta: 'Same as last week',
      deltaColor: '#6B7280',
      sparkline: [6, 6, 5, 6],
      icon: `
        <svg width="18" height="18" fill="none" stroke="#7C3AED" stroke-width="1.9" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.5 18.25v-1.1a3.15 3.15 0 0 0-3.15-3.15h-2.7A3.15 3.15 0 0 0 6.5 17.15v1.1"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 18.25v-.7a2.55 2.55 0 0 0-2.1-2.51"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 18.25v-.7a2.55 2.55 0 0 1 2.1-2.51"/>
          <circle cx="11" cy="8.75" r="3"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.8 6.95a2.35 2.35 0 1 1 0 3.6"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.2 6.95a2.35 2.35 0 1 0 0 3.6"/>
        </svg>
      `,
    },
    {
      num: 42,
      label: 'Total adjustments',
      accent: '#D97706',
      iconBg: '#FEF3C7',
      iconStroke: '#D97706',
      delta: '+8 from last week',
      deltaColor: '#059669',
      sparkline: [28, 31, 34, 42],
      icon: `
        <svg width="18" height="18" fill="none" stroke="#D97706" stroke-width="1.9" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7.25h8.25"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.75 4.75 16.25 7.25 13.75 9.75"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 16.75H7.75"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.25 14.25 7.75 16.75 10.25 19.25"/>
        </svg>
      `,
    },
  ]

  document.getElementById('section-stats').innerHTML = cards.map((c) => `
    <div style="overflow:hidden;border-radius:12px;position:relative;border:1px solid #E5E7EB;background:white">
      <div style="height:3px;width:100%;margin:0;padding:0;display:block;background:${c.accent}"></div>
      <div style="padding:20px 24px">
        <div style="width:36px;height:36px;border-radius:10px;background:${c.iconBg};display:flex;align-items:center;justify-content:center;margin-bottom:14px">
          ${c.icon}
        </div>
        <div style="font-size:32px;font-weight:700;color:#111827;line-height:1;margin-bottom:8px">${c.num}</div>
        <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280">${c.label}</div>
        <div style="font-size:12px;line-height:1.5;color:${c.deltaColor};margin-top:10px">${c.delta}</div>
        ${sparklineSvg(c.sparkline, c.accent)}
      </div>
    </div>
  `).join('')
}

// ── Section B: AI Summary ─────────────────────────────────────────────────────
function renderAISummary(metrics) {
  const section = document.getElementById('section-ai')
  if (!section) return

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

  section.innerHTML = `
    <div style="margin-bottom:6px">
      <span style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280">
        AI Summary
      </span>
    </div>
    <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 16px">
      Live teaching recommendation
    </h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      ${subCards.map((c) => `
        <div style="
          background:white;
          border-radius:10px;
          padding:14px;
          box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
        ">
          <p style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280;margin:0 0 8px">
            ${c.label}
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.6;margin:0">
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
        padding:3px 10px; border-radius:999px;
        font-size:11px; font-weight:500;
        text-transform:uppercase; letter-spacing:0.06em;
        background:${n.bg}; color:${n.text};
      ">${n.label}</span>
    `).join('')

    const lessonNames = metrics.lessonSummaries
      .filter((entry) => entry.studentIds.includes(stat.studentId))
      .map((entry) => entry.lesson.title)
      .join(' · ')
    const isExpanded = expandedStudentIds.has(stat.studentId)

    return `
      <div style="cursor:pointer" onclick="toggleStudentSummaryDetail('${stat.studentId}')">
        <div style="
          display:flex; align-items:center; gap:16px;
          background:white;
          border-radius:16px; padding:16px 18px;
          box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
        ">
          <!-- Avatar + Name + Need tags -->
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;width:220px">
            <div style="
              width:40px; height:40px; border-radius:9999px;
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
        <div style="
          max-height:${isExpanded ? '32px' : '0'};
          overflow:hidden;
          transition:max-height 0.2s ease;
        ">
          <div style="font-size:12px;color:#6B7280;line-height:1.5;padding:8px 6px 2px 6px">
            Appeared in: ${lessonNames}
          </div>
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
      background:white;
      border-radius:16px; padding:14px 16px;
      box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    ">
      <!-- Rank + title + subtitle -->
      <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
        <div style="
          width:28px; height:28px; border-radius:9999px;
          background:${i === 0 ? '#059669' : (RANK_COLORS[i] || '#9CA3AF')};
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; font-size:12px; font-weight:700; color:white;
        ">${i + 1}</div>
        <div style="min-width:0">
          <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            ${entry.lesson.title}
            ${i === 0 ? `<span style="background:#D1FAE5;color:#065F46;font-size:11px;padding:2px 8px;border-radius:20px">Highest load</span>` : ''}
          </div>
          <div style="font-size:13px;color:#6B7280">
            ${entry.lesson.subject} · ${entry.lesson.schedule}
          </div>
        </div>
      </div>
      <!-- Adjustment count -->
      <div style="flex-shrink:0;text-align:right;margin-left:16px">
        <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280;margin-bottom:2px">
          Adjustments
        </div>
        <div style="font-size:18px;font-weight:700;color:#111827">${entry.count}</div>
      </div>
    </div>
  `).join('')
}

// ── Section E: Support patterns ───────────────────────────────────────────────
const PATTERN_CONFIG = [
  { key: 'Visual',        label: 'Visual scaffolds',      color: '#059669', badgeBg: '#D1FAE5', badgeText: '#065F46' },
  { key: 'Participation', label: 'Participation',          color: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#92400E' },
  { key: 'Assessment',    label: 'Assessment',             color: '#7C3AED', badgeBg: '#EDE9FE', badgeText: '#5B21B6' },
  { key: 'Technology',    label: 'Technology',             color: '#3B82F6', badgeBg: '#DBEAFE', badgeText: '#1D4ED8' },
]

function renderSupportPatterns(metrics) {
  const maxVal = Math.max(...Object.values(metrics.totalsByType), 1)
  let mostUsedAssigned = false

  document.getElementById('section-patterns').innerHTML = PATTERN_CONFIG.map((p) => {
    const val = metrics.totalsByType[p.key] || 0
    const pct = Math.round((val / maxVal) * 100)
    const showMostUsed = !mostUsedAssigned && val === maxVal
    if (showMostUsed) mostUsedAssigned = true

    return `
      <div style="display:flex;align-items:center;gap:14px;background:white;border-radius:16px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)">
        <!-- Coloured dot -->
        <div style="
          width:10px; height:10px; border-radius:9999px;
          background:${p.color}; flex-shrink:0;
        "></div>

        <!-- Type name -->
        <span style="font-size:14px;color:#374151;width:180px;flex-shrink:0;display:flex;align-items:center">
          ${p.label}
          ${showMostUsed ? `<span style="background:#D1FAE5;color:#065F46;font-size:11px;padding:2px 8px;border-radius:20px;margin-left:8px">Most used</span>` : ''}
        </span>

        <!-- Count badge -->
        <div style="
          display:inline-flex; align-items:center; justify-content:center;
          padding:3px 10px; border-radius:999px; flex-shrink:0;
          background:${p.badgeBg}; min-width:28px;
        ">
          <span style="font-size:11px;font-weight:500;color:${p.badgeText}">${val}</span>
        </div>

        <!-- Proportion bar -->
        <div style="flex:1;height:10px;background:#E5E7EB;border-radius:9999px;overflow:hidden">
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

function toggleStudentSummaryDetail(studentId) {
  if (expandedStudentIds.has(studentId)) {
    expandedStudentIds.delete(studentId)
  } else {
    expandedStudentIds.add(studentId)
  }
  renderStudentRows(getSummaryMetrics())
}

window.toggleStudentSummaryDetail = toggleStudentSummaryDetail

renderSummaryPage()

// ── Global click handler (close focus panel if open) ─────────────────────────
document.addEventListener('click', (event) => {
  const closeFocus = event.target.closest('#close-focus-panel')
  const focusOverlay = event.target.closest('#focus-overlay')
  if (closeFocus || focusOverlay) {
    closeFocusMode()
  }
})
