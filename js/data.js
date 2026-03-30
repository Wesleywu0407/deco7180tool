// ─── Students ─────────────────────────────────────────────────────────────────
const STUDENTS = [
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
    notes: 'Liam needs clear, consistent structure. Unexpected changes cause anxiety — always give advance notice of transitions.',
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
    avatarBg: '#EC4899',
    needs: [{ label: 'Physical', bg: '#FCE7F3', text: '#9D174D' }, { label: 'Dyslexia', bg: '#DBEAFE', text: '#1D4ED8' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: 'Jack has limited upper-limb mobility making handwriting difficult, alongside dyslexia. Tech-assisted approaches work best.',
    strategies: ['All tasks completed via iPad with stylus', 'Speech-to-text as alternative to written response', 'Digital visual diagrams replacing text-heavy materials'],
  },
  {
    id: 'sofia', initials: 'SM', name: 'Sofia M.', color: 'green',
    avatarBg: '#10B981',
    needs: [{ label: 'Hearing', bg: '#D1FAE5', text: '#065F46' }],
    year: 'Year 5', cls: 'Class 5B',
    notes: 'Sofia wears bilateral hearing aids. She relies heavily on lip-reading and written support. Ensure she is always seated at the front.',
    strategies: ['Seat Sofia at the front of the classroom', 'Use written instructions alongside verbal explanations', 'Ensure captions are enabled on all video content'],
  },
]

// ─── Lessons ──────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 'math-fractions',
    subject: 'MATHEMATICS', year: 'YEAR 5',
    title: 'Adding fractions with unlike denominators',
    schedule: 'Tuesday period 2 · 60 min',
    studentIds: ['maya', 'liam', 'priya'],
    adjustmentCount: 9,
    goals: 'Students will identify the lowest common denominator, convert fractions, and solve addition problems accurately.',
    assessment: 'Written worked examples and an exit slip completed before the end of the lesson.',
    subjectTagBg: '#D1FAE5', subjectTagText: '#065F46',
  },
  {
    id: 'english-narrative',
    subject: 'ENGLISH', year: 'YEAR 5',
    title: 'Narrative writing structure',
    schedule: 'Wednesday period 1 · 60 min',
    studentIds: ['maya', 'jack'],
    adjustmentCount: 6,
    goals: 'Students will plan a narrative using an orientation–complication–resolution structure and begin drafting their opening.',
    assessment: 'A written planning scaffold submitted at the end of the lesson.',
    subjectTagBg: '#DBEAFE', subjectTagText: '#1D4ED8',
  },
  {
    id: 'science-foodchains',
    subject: 'SCIENCE', year: 'YEAR 5',
    title: 'Food chains and ecosystems',
    schedule: 'Thursday period 3 · 50 min',
    studentIds: ['liam', 'sofia'],
    adjustmentCount: 5,
    goals: 'Students will construct a food chain diagram and explain energy transfer between producers and consumers.',
    assessment: 'A labelled diagram and a short written explanation submitted digitally.',
    subjectTagBg: '#FEF3C7', subjectTagText: '#92400E',
  },
]

// ─── Adjustments per lesson ───────────────────────────────────────────────────
const ADJUSTMENTS = {
  'math-fractions': [
    { id: 'mf-1', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'maya',  studentName: 'Maya R.',  description: 'Replace written instructions with visual fraction bar diagrams.', checked: false },
    { id: 'mf-2', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'maya',  studentName: 'Maya R.',  description: 'Provide a pre-printed worked example with colour-coded steps.', checked: false },
    { id: 'mf-3', category: 'ASSESSMENT',   catBg: '#EDE9FE', catText: '#5B21B6', studentId: 'maya',  studentName: 'Maya R.',  description: 'Allow oral explanation of method as an alternative to the written exit slip.', checked: false },
    { id: 'mf-4', category: 'PARTICIPATION',catBg: '#FEF3C7', catText: '#92400E', studentId: 'priya', studentName: 'Priya K.', description: 'Break the lesson into 3 timed chunks of 10 minutes with a 2-minute movement break.', checked: false },
    { id: 'mf-5', category: 'TECHNOLOGY',   catBg: '#D1FAE5', catText: '#065F46', studentId: 'priya', studentName: 'Priya K.', description: 'Display a visual countdown timer on the board to support self-regulation.', checked: true },
  ],
  'english-narrative': [
    { id: 'en-1', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'maya', studentName: 'Maya R.', description: 'Provide a visual story scaffold with images for each narrative stage.', checked: false },
    { id: 'en-2', category: 'ASSESSMENT',   catBg: '#EDE9FE', catText: '#5B21B6', studentId: 'maya', studentName: 'Maya R.', description: 'Accept a voice-recorded planning summary instead of written notes.', checked: true },
    { id: 'en-3', category: 'TECHNOLOGY',   catBg: '#D1FAE5', catText: '#065F46', studentId: 'jack', studentName: 'Jack W.', description: 'Allow Jack to use speech-to-text software for drafting.', checked: false },
    { id: 'en-4', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'jack', studentName: 'Jack W.', description: 'Provide digital graphic organiser via iPad instead of paper worksheet.', checked: false },
    { id: 'en-5', category: 'PARTICIPATION',catBg: '#FEF3C7', catText: '#92400E', studentId: 'maya', studentName: 'Maya R.', description: 'Pair Maya with a reading buddy for the annotation activity.', checked: true },
    { id: 'en-6', category: 'ASSESSMENT',   catBg: '#EDE9FE', catText: '#5B21B6', studentId: 'jack', studentName: 'Jack W.', description: 'Reduce written output expectation — focus on planning scaffold only.', checked: false },
  ],
  'science-foodchains': [
    { id: 'sf-1', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'liam',  studentName: 'Liam T.',  description: 'Provide a printed lesson agenda at the start of the session.', checked: true },
    { id: 'sf-2', category: 'TECHNOLOGY',   catBg: '#D1FAE5', catText: '#065F46', studentId: 'sofia', studentName: 'Sofia M.', description: 'Enable closed captions on the ecosystem video before playing.', checked: false },
    { id: 'sf-3', category: 'PARTICIPATION',catBg: '#FEF3C7', catText: '#92400E', studentId: 'liam',  studentName: 'Liam T.',  description: 'Give Liam a 3-minute verbal warning before transitioning between tasks.', checked: false },
    { id: 'sf-4', category: 'MATERIALS',    catBg: '#DBEAFE', catText: '#1D4ED8', studentId: 'sofia', studentName: 'Sofia M.', description: 'Seat Sofia at the front and ensure the teacher faces her when speaking.', checked: true },
    { id: 'sf-5', category: 'ASSESSMENT',   catBg: '#EDE9FE', catText: '#5B21B6', studentId: 'liam',  studentName: 'Liam T.',  description: 'Allow digital diagram submission with a consistent template layout.', checked: false },
  ],
}

// ─── Weekly summary ───────────────────────────────────────────────────────────
const WEEKLY_STATS = [
  { studentId: 'maya',  items: 6, lessons: 2, barColor: '#3B82F6', pct: 60 },
  { studentId: 'liam',  items: 6, lessons: 2, barColor: '#7C3AED', pct: 60 },
  { studentId: 'priya', items: 3, lessons: 1, barColor: '#D97706', pct: 30 },
  { studentId: 'jack',  items: 3, lessons: 1, barColor: '#EC4899', pct: 30 },
  { studentId: 'sofia', items: 2, lessons: 1, barColor: '#10B981', pct: 20 },
]

const CHART_DATA = {
  labels: ['Visual', 'Extra Time', 'Breaks', 'Aids'],
  datasets: [
    { label: 'Maya',  data: [3, 1, 0, 2], backgroundColor: '#3B82F6' },
    { label: 'Liam',  data: [1, 0, 1, 2], backgroundColor: '#7C3AED' },
    { label: 'Priya', data: [0, 1, 2, 0], backgroundColor: '#D97706' },
    { label: 'Jack',  data: [2, 1, 0, 0], backgroundColor: '#EC4899' },
  ],
}

// helper
function getStudent(id) { return STUDENTS.find(s => s.id === id) }
