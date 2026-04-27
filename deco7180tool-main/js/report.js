const reportData = window.AdjustStore.getWeeklyReportData()

document.getElementById('report-week-label').textContent = reportData.weekLabel
document.getElementById('report-teacher').textContent = reportData.teacherName
document.getElementById('report-export-date').textContent = reportData.exportDate

document.getElementById('report-overview').innerHTML = [
  { label: 'Lessons this week', value: reportData.lessonsThisWeek },
  { label: 'SEN students', value: reportData.senStudents },
  { label: 'Total adjustments', value: reportData.totalAdjustments },
].map((item) => `
  <div class="surface-card p-5">
    <p class="text-sm text-gray-500">${item.label}</p>
    <p class="text-3xl font-bold text-gray-900 mt-2">${item.value}</p>
  </div>
`).join('')

document.getElementById('report-student-rows').innerHTML = reportData.studentSummaries.map((student) => `
  <tr>
    <td class="font-semibold text-gray-900">${student.name}</td>
    <td>${student.needs}</td>
    <td>${student.adjustments}</td>
    <td>${student.lessonsImpacted}</td>
    <td>${student.mainSupportArea}</td>
  </tr>
`).join('')

const repeatedNames = reportData.repeatedVisualSupport.map((student) => window.AdjustStore.getStudent(student.studentId)?.name).filter(Boolean)
const nextFocus = reportData.nextWeekFocus

document.getElementById('report-insights').innerHTML = [
  {
    title: 'Most common adjustment type',
    body: `${reportData.mostCommonType} support was the strongest pattern in this week's planning.`,
  },
  {
    title: 'Students needing repeated visual support',
    body: repeatedNames.length ? repeatedNames.join(', ') : 'No repeated visual support patterns were recorded this week.',
  },
  {
    title: 'Suggested focus for next week',
    body: nextFocus
      ? `${nextFocus.title} should prioritise visual scaffolds for ${nextFocus.studentIds.length} students.`
      : 'Continue monitoring recurring support patterns in upcoming lessons.',
  },
].map((insight) => `
  <div class="surface-card p-5">
    <p class="page-label mb-3">${insight.title}</p>
    <p class="text-sm text-gray-700 leading-relaxed">${insight.body}</p>
  </div>
`).join('')

document.getElementById('print-report').addEventListener('click', () => {
  window.print()
})

document.getElementById('back-to-dashboard').addEventListener('click', () => {
  location.href = 'summary.html'
})
