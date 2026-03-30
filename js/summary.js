// ─── Weekly Summary page ──────────────────────────────────────────────────────

renderSidebar('summary')

// ── Stat cards ────────────────────────────────────────────────────────────────
function renderStatCards() {
  const stats = [
    { number: '4',  label: 'Lessons this week' },
    { number: '5',  label: 'SEN students' },
    { number: '20', label: 'Total adjustments' },
  ]
  document.getElementById('stat-cards').innerHTML = stats.map(s => `
    <div class="rounded-xl p-6 flex flex-col items-start" style="background:#F5F5F0">
      <span class="text-4xl font-bold leading-none mb-2" style="color:#1D9E75">${s.number}</span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">${s.label}</span>
    </div>
  `).join('')
}

// ── Student rows ──────────────────────────────────────────────────────────────
const NEED_ICONS = {
  blue:   `<svg fill="none" stroke="#3B82F6" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  purple: `<svg fill="none" stroke="#7C3AED" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  amber:  `<svg fill="none" stroke="#D97706" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  pink:   `<svg fill="none" stroke="#EC4899" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/></svg>`,
  green:  `<svg fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"/></svg>`,
}
const ICON_BG = { blue:'#DBEAFE', purple:'#EDE9FE', amber:'#FEF3C7', pink:'#FCE7F3', green:'#D1FAE5' }

function renderStudentRows() {
  document.getElementById('student-rows').innerHTML = WEEKLY_STATS.map(stat => {
    const s = getStudent(stat.studentId)
    if (!s) return ''
    const needTags = s.needs.map(n =>
      `<span class="tag" style="background:${n.bg};color:${n.text}">${n.label}</span>`
    ).join('')
    return `
      <div class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div class="flex items-center gap-3" style="width:208px;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:9999px;background:${ICON_BG[s.color]};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${NEED_ICONS[s.color]}
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${s.name}</p>
            <div class="flex flex-wrap gap-1 mt-0.5">${needTags}</div>
          </div>
        </div>
        <p class="text-sm text-gray-500" style="width:144px;flex-shrink:0">
          ${stat.items} items · ${stat.lessons} ${stat.lessons === 1 ? 'lesson' : 'lessons'}
        </p>
        <div class="flex flex-1 items-center gap-3">
          <div style="flex:1;height:8px;background:#e5e7eb;border-radius:9999px;overflow:hidden">
            <div style="height:100%;width:${stat.pct}%;background:${stat.barColor};border-radius:9999px"></div>
          </div>
          <span class="text-xs text-gray-500" style="width:32px;text-align:right">${stat.pct}%</span>
        </div>
      </div>`
  }).join('')
}

// ── Chart ─────────────────────────────────────────────────────────────────────
function renderChart() {
  const ctx = document.getElementById('adj-chart').getContext('2d')
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CHART_DATA.labels,
      datasets: CHART_DATA.datasets.map(d => ({
        ...d,
        borderRadius: 3,
        borderSkipped: false,
      })),
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          bodyFont: { size: 12 },
          titleFont: { size: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6b7280' },
          border: { display: false },
        },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 11 }, color: '#6b7280', stepSize: 1 },
          border: { display: false },
        },
      },
    },
  })
}

// ── Init ───────────────────────────────────────────────────────────────────────
renderStatCards()
renderStudentRows()
renderChart()
