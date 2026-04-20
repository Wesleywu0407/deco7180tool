const DEFAULT_STUDENTS = [
  {
    id: 'maya', initials: 'MR', name: 'Maya R.', color: 'blue',
    avatarBg: '#3B82F6',
    needs: [{ label: 'Dyslexia', bg: '#DBEAFE', text: '#1D4ED8' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: "Maya's decoding is weaker but her verbal reasoning and logic are strong. Prioritise visual supports over dense text.",
    strategies: ['Replace text instructions with visual diagrams', 'Provide colour-coded worked examples', 'Allow oral response instead of written assessment'],
  },
  {
    id: 'liam', initials: 'LT', name: 'Liam T.', color: 'purple',
    avatarBg: '#7C3AED',
    needs: [{ label: 'ASD', bg: '#EDE9FE', text: '#5B21B6' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: 'Liam needs clear, consistent structure. Unexpected changes cause anxiety - always give advance notice of transitions.',
    strategies: ['Display written lesson agenda at the start', 'Give 3-minute verbal warning before transitions', 'Keep worksheet layout consistent every time'],
  },
  {
    id: 'priya', initials: 'PK', name: 'Priya K.', color: 'amber',
    avatarBg: '#D97706',
    needs: [{ label: 'ADHD', bg: '#FEF3C7', text: '#92400E' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: "Priya's focus window is around 10 minutes. Structured short tasks with movement breaks significantly improve engagement.",
    strategies: ['Break lesson into 10-min timed segments', 'Display a visual countdown timer on the board', 'Present steps one at a time to avoid overload'],
  },
  {
    id: 'jack', initials: 'JW', name: 'Jack W.', color: 'pink',
    avatarBg: '#DB2777',
    needs: [{ label: 'Physical', bg: '#FCE7F3', text: '#9D174D' }, { label: 'Dyslexia', bg: '#DBEAFE', text: '#1D4ED8' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: 'Jack has limited upper-limb mobility making handwriting difficult, alongside dyslexia. Tech-assisted approaches work best.',
    strategies: ['All tasks completed via iPad with stylus', 'Speech-to-text as alternative to written response', 'Digital visual diagrams replacing text-heavy materials'],
  },
  {
    id: 'sofia', initials: 'SM', name: 'Sofia M.', color: 'green',
    avatarBg: '#059669',
    needs: [{ label: 'Hearing', bg: '#D1FAE5', text: '#065F46' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: 'Sofia wears bilateral hearing aids. She relies heavily on lip-reading and written support. Ensure she is always seated at the front.',
    strategies: ['Seat Sofia at the front of the classroom', 'Use written instructions alongside verbal explanations', 'Ensure captions are enabled on all video content'],
  },
]

const DEFAULT_LESSONS = [
  {
    id: 'math-fractions',
    subject: 'MATHEMATICS', year: 'YEAR 5',
    title: 'Adding fractions with unlike denominators',
    schedule: 'Tuesday period 2 · 60 min',
    date: 'Tuesday',
    session: 'Period 2',
    duration: '60 min',
    studentIds: ['maya', 'liam', 'priya'],
    goals: 'Students will identify the lowest common denominator, convert fractions, and solve addition problems accurately.',
    assessment: 'Written worked examples and an exit slip completed before the end of the lesson.',
  },
  {
    id: 'english-narrative',
    subject: 'ENGLISH', year: 'YEAR 5',
    title: 'Narrative writing structure',
    schedule: 'Wednesday period 1 · 60 min',
    date: 'Wednesday',
    session: 'Period 1',
    duration: '60 min',
    studentIds: ['maya', 'jack'],
    goals: 'Students will plan a narrative using an orientation-complication-resolution structure and begin drafting their opening.',
    assessment: 'A written planning scaffold submitted at the end of the lesson.',
  },
  {
    id: 'science-foodchains',
    subject: 'SCIENCE', year: 'YEAR 5',
    title: 'Food chains and ecosystems',
    schedule: 'Thursday period 3 · 50 min',
    date: 'Thursday',
    session: 'Period 3',
    duration: '50 min',
    studentIds: ['liam', 'sofia'],
    goals: 'Students will construct a food chain diagram and explain energy transfer between producers and consumers.',
    assessment: 'A labelled diagram and a short written explanation submitted digitally.',
  },
  {
    id: 'geometry-unit',
    subject: 'MATHEMATICS', year: 'YEAR 5',
    title: 'Geometry unit: classifying angles and shape properties',
    schedule: 'Friday period 1 · 55 min',
    date: 'Friday',
    session: 'Period 1',
    duration: '55 min',
    studentIds: ['maya', 'jack', 'sofia'],
    goals: 'Students will identify acute, obtuse, and right angles, then compare shape properties using visual models and guided examples.',
    assessment: 'Students will complete a labelled sorting task and record one explanation using a scaffolded response frame.',
  },
]

const DEFAULT_TEACHER_PROFILE = {
  fullName: 'Mrs. Chen',
  role: 'SEN Specialist',
  yearLevel: 'Year 5',
  classGroup: 'Class 5B',
  email: 'mchen@adjust.school',
}

const STORAGE_KEYS = {
  students: 'adjust.students.v1',
  lessons: 'adjust.lessons.v1',
  teacherProfile: 'adjust.teacher-profile.v1',
}

const NEED_STYLES = {
  dyslexia: { bg: '#DBEAFE', text: '#1D4ED8' },
  asd: { bg: '#EDE9FE', text: '#5B21B6' },
  adhd: { bg: '#FEF3C7', text: '#92400E' },
  physical: { bg: '#FCE7F3', text: '#9D174D' },
  hearing: { bg: '#D1FAE5', text: '#065F46' },
  anxiety: { bg: '#E0F2FE', text: '#0369A1' },
  language: { bg: '#FCE7F3', text: '#BE185D' },
  default: { bg: '#E5E7EB', text: '#4B5563' },
}

const AVATAR_PALETTE = [
  { color: 'blue', avatarBg: '#3B82F6' },
  { color: 'purple', avatarBg: '#7C3AED' },
  { color: 'amber', avatarBg: '#D97706' },
  { color: 'pink', avatarBg: '#DB2777' },
  { color: 'green', avatarBg: '#059669' },
  { color: 'teal', avatarBg: '#14B8A6' },
]

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function toUpperLabel(value) {
  return String(value).trim().toUpperCase()
}

function makeInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function colorForName(name) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function styleNeed(label) {
  const style = NEED_STYLES[label.trim().toLowerCase()] || NEED_STYLES.default
  return { label: titleCase(label.trim()), bg: style.bg, text: style.text }
}

function normalizeStudent(student) {
  const palette = student.avatarBg && student.color ? { avatarBg: student.avatarBg, color: student.color } : colorForName(student.name)

  return {
    id: student.id || slugify(student.name),
    initials: student.initials || makeInitials(student.name),
    name: student.name.trim(),
    color: palette.color,
    avatarBg: palette.avatarBg,
    needs: student.needs.map((need) => typeof need === 'string' ? styleNeed(need) : styleNeed(need.label)),
    year: titleCase(student.year.trim()),
    cls: titleCase(student.cls.trim()),
    notes: student.notes.trim(),
    strategies: student.strategies.map((strategy) => strategy.trim()).filter(Boolean),
  }
}

function lessonSchedule(date, session, duration) {
  return [date, session].filter(Boolean).join(' ').trim() + ` · ${duration}`
}

function normalizeLesson(lesson) {
  const subject = toUpperLabel(lesson.subject)
  const year = toUpperLabel(lesson.year)
  const date = titleCase(lesson.date.trim())
  const session = lesson.session.trim()
  const duration = lesson.duration.trim()

  return {
    id: lesson.id || slugify(`${lesson.subject}-${lesson.title}-${Date.now()}`),
    subject,
    year,
    title: lesson.title.trim(),
    date,
    session,
    duration,
    schedule: lesson.schedule || lessonSchedule(date, session, duration),
    goals: lesson.goals.trim(),
    assessment: lesson.assessment.trim(),
    studentIds: Array.isArray(lesson.studentIds) ? lesson.studentIds : [],
  }
}

function seedStore() {
  const storedStudents = safeRead(STORAGE_KEYS.students, null)
  if (!storedStudents) {
    safeWrite(STORAGE_KEYS.students, DEFAULT_STUDENTS)
  } else {
    const mergedStudents = [...storedStudents]
    DEFAULT_STUDENTS.forEach((student) => {
      if (!mergedStudents.some((entry) => entry.id === student.id)) {
        mergedStudents.push(student)
      }
    })
    safeWrite(STORAGE_KEYS.students, mergedStudents)
  }

  const storedLessons = safeRead(STORAGE_KEYS.lessons, null)
  if (!storedLessons) {
    safeWrite(STORAGE_KEYS.lessons, DEFAULT_LESSONS)
  } else {
    const mergedLessons = [...storedLessons]
    DEFAULT_LESSONS.forEach((lesson) => {
      if (!mergedLessons.some((entry) => entry.id === lesson.id)) {
        mergedLessons.push(lesson)
      }
    })
    safeWrite(STORAGE_KEYS.lessons, mergedLessons)
  }

  if (!localStorage.getItem(STORAGE_KEYS.teacherProfile)) {
    safeWrite(STORAGE_KEYS.teacherProfile, DEFAULT_TEACHER_PROFILE)
  }
}

function getStudents() {
  return clone(safeRead(STORAGE_KEYS.students, DEFAULT_STUDENTS))
}

function getLessons() {
  return clone(safeRead(STORAGE_KEYS.lessons, DEFAULT_LESSONS))
}

function getTeacherProfile() {
  return { ...DEFAULT_TEACHER_PROFILE, ...safeRead(STORAGE_KEYS.teacherProfile, DEFAULT_TEACHER_PROFILE) }
}

function getStudent(id) {
  return getStudents().find((student) => student.id === id)
}

function getLesson(id) {
  return getLessons().find((lesson) => lesson.id === id)
}

function saveStudent(studentInput) {
  const students = getStudents()
  const student = normalizeStudent(studentInput)
  students.push(student)
  safeWrite(STORAGE_KEYS.students, students)
  return student
}

function saveLesson(lessonInput) {
  const lessons = getLessons()
  const lesson = normalizeLesson(lessonInput)
  lessons.unshift(lesson)
  safeWrite(STORAGE_KEYS.lessons, lessons)
  return lesson
}

function updateLesson(lessonId, lessonInput) {
  const lessons = getLessons()
  const lesson = normalizeLesson({
    ...lessonInput,
    id: lessonId,
  })
  const updatedLessons = lessons.map((entry) => entry.id === lessonId ? lesson : entry)
  safeWrite(STORAGE_KEYS.lessons, updatedLessons)
  return lesson
}

function deleteLesson(lessonId) {
  const lessons = getLessons().filter((lesson) => lesson.id !== lessonId)
  safeWrite(STORAGE_KEYS.lessons, lessons)
}

function saveTeacherProfile(profileInput) {
  const profile = {
    ...getTeacherProfile(),
    ...profileInput,
  }
  safeWrite(STORAGE_KEYS.teacherProfile, profile)
  window.adjustTeacherProfile = profile
  return profile
}

function lessonAdjustmentCount(lesson, students = getStudents()) {
  return lesson.studentIds.reduce((count, studentId) => {
    const student = students.find((entry) => entry.id === studentId)
    if (!student) return count
    return count + Math.max(1, Math.min(3, student.needs.length + Math.min(student.strategies.length, 2)))
  }, 0)
}

function needCategory(label) {
  const value = label.toLowerCase()
  if (value.includes('dyslexia')) return 'Materials'
  if (value.includes('asd')) return 'Participation'
  if (value.includes('adhd')) return 'Participation'
  if (value.includes('hearing')) return 'Materials'
  if (value.includes('physical')) return 'Technology'
  return 'Support'
}

function categoryStyle(category) {
  if (category === 'Materials') return { catBg: '#DBEAFE', catText: '#1D4ED8' }
  if (category === 'Assessment') return { catBg: '#EDE9FE', catText: '#5B21B6' }
  if (category === 'Technology') return { catBg: '#D1FAE5', catText: '#065F46' }
  if (category === 'Participation') return { catBg: '#FEF3C7', catText: '#92400E' }
  return { catBg: '#E5E7EB', catText: '#4B5563' }
}

function generateAdjustmentSuggestions(lesson, selectedIds) {
  if (!selectedIds.length) return []

  const students = getStudents()
  const seen = new Set()
  const suggestions = []

  selectedIds.forEach((studentId) => {
    const student = students.find((entry) => entry.id === studentId)
    if (!student) return

    student.needs.forEach((need, index) => {
      const category = needCategory(need.label)
      const key = `${studentId}-${need.label}-${index}`
      if (seen.has(key)) return
      seen.add(key)
      suggestions.push({
        id: key,
        studentId,
        studentName: student.name,
        description: `${need.label} support: align ${lesson.subject.toLowerCase()} tasks with ${student.name.split(' ')[0]}'s classroom profile.`,
        category,
        checked: false,
        ...categoryStyle(category),
      })
    })

    student.strategies.slice(0, 3).forEach((strategy, index) => {
      const category = index === 0 ? 'Materials' : index === 1 ? 'Participation' : 'Assessment'
      const key = `${studentId}-strategy-${index}`
      if (seen.has(key)) return
      seen.add(key)
      suggestions.push({
        id: key,
        studentId,
        studentName: student.name,
        description: strategy,
        category,
        checked: false,
        ...categoryStyle(category),
      })
    })
  })

  return suggestions
}

function weeklyStats() {
  const students = getStudents()
  const lessons = getLessons()

  return students.map((student) => {
    const lessonsForStudent = lessons.filter((lesson) => lesson.studentIds.includes(student.id))
    const breakdown = {
      Visual: 0,
      Assessment: 0,
      Participation: 0,
      Technology: 0,
    }

    lessonsForStudent.forEach(() => {
      student.needs.forEach((need) => {
        const category = needCategory(need.label)
        if (category === 'Materials') breakdown.Visual += 1
        if (category === 'Assessment') breakdown.Assessment += 1
        if (category === 'Participation') breakdown.Participation += 1
        if (category === 'Technology') breakdown.Technology += 1
      })

      student.strategies.slice(0, 3).forEach((strategy, index) => {
        if (index === 0) breakdown.Visual += 1
        if (index === 1) breakdown.Participation += 1
        if (index >= 2) breakdown.Assessment += 1
        if (strategy.toLowerCase().includes('ipad') || strategy.toLowerCase().includes('digital') || strategy.toLowerCase().includes('captions')) {
          breakdown.Technology += 1
        }
      })
    })

    const items = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
    return {
      studentId: student.id,
      items,
      lessons: lessonsForStudent.length,
      barColor: student.avatarBg,
      pct: Math.min(100, lessonsForStudent.length * 20),
      breakdown,
    }
  })
}

function getWeeklyReportData() {
  const lessons = getLessons()
  const students = getStudents()
  const teacher = getTeacherProfile()
  const stats = weeklyStats()
  const totalAdjustments = lessons.reduce((count, lesson) => count + lessonAdjustmentCount(lesson, students), 0)

  const totalsByType = stats.reduce((accumulator, stat) => {
    Object.entries(stat.breakdown).forEach(([key, value]) => {
      accumulator[key] = (accumulator[key] || 0) + value
    })
    return accumulator
  }, { Visual: 0, Assessment: 0, Participation: 0, Technology: 0 })

  const mostCommonType = Object.entries(totalsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'
  const repeatedVisualSupport = stats.filter((stat) => stat.breakdown.Visual >= 2)
  const nextWeekFocus = getLesson('geometry-unit')

  const studentSummaries = stats.map((stat) => {
    const student = getStudent(stat.studentId)
    const mainSupportArea = Object.entries(stat.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Visual'

    return {
      id: stat.studentId,
      name: student?.name || stat.studentId,
      needs: student?.needs.map((need) => need.label).join(', ') || '',
      adjustments: stat.items,
      lessonsImpacted: stat.lessons,
      mainSupportArea,
    }
  })

  return {
    weekLabel: 'Week 9 · Term 2',
    teacherName: teacher.fullName,
    exportDate: new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    lessonsThisWeek: lessons.length,
    senStudents: students.length,
    totalAdjustments,
    mostCommonType,
    repeatedVisualSupport,
    nextWeekFocus,
    studentSummaries,
  }
}

seedStore()
window.adjustTeacherProfile = getTeacherProfile()

window.AdjustStore = {
  getStudents,
  getLessons,
  getTeacherProfile,
  getStudent,
  getLesson,
  saveStudent,
  saveLesson,
  updateLesson,
  deleteLesson,
  saveTeacherProfile,
  lessonAdjustmentCount,
  generateAdjustmentSuggestions,
  weeklyStats,
  getWeeklyReportData,
  makeInitials,
  styleNeed,
}
