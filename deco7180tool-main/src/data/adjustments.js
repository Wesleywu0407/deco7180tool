// ─── Adjustments data ─────────────────────────────────────────────────────────
// Suggested adjustments keyed by lesson id.
// `checked` is the default state; runtime state lives in component state.

export const adjustmentsByLesson = {
  'math-fractions': [
    {
      id: 'mf-1',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Replace written instructions with visual fraction bar diagrams.',
      checked: false,
    },
    {
      id: 'mf-2',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Provide a pre-printed worked example with colour-coded steps.',
      checked: false,
    },
    {
      id: 'mf-3',
      category: 'ASSESSMENT',
      categoryColor: 'bg-purple-100 text-purple-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Allow oral explanation of method as an alternative to the written exit slip.',
      checked: false,
    },
    {
      id: 'mf-4',
      category: 'PARTICIPATION',
      categoryColor: 'bg-amber-100 text-amber-700',
      studentId: 'priya',
      studentName: 'Priya K.',
      description: 'Break the lesson into 3 timed chunks of 10 minutes with a 2-minute movement break.',
      checked: false,
    },
    {
      id: 'mf-5',
      category: 'TECHNOLOGY',
      categoryColor: 'bg-green-100 text-green-700',
      studentId: 'priya',
      studentName: 'Priya K.',
      description: 'Display a visual countdown timer on the board to support self-regulation.',
      checked: true,
    },
  ],

  'english-narrative': [
    {
      id: 'en-1',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Provide a visual story scaffold with images for each narrative stage.',
      checked: false,
    },
    {
      id: 'en-2',
      category: 'ASSESSMENT',
      categoryColor: 'bg-purple-100 text-purple-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Accept a voice-recorded planning summary instead of written notes.',
      checked: true,
    },
    {
      id: 'en-3',
      category: 'TECHNOLOGY',
      categoryColor: 'bg-green-100 text-green-700',
      studentId: 'jack',
      studentName: 'Jack W.',
      description: 'Allow Jack to use speech-to-text software for drafting.',
      checked: false,
    },
    {
      id: 'en-4',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'jack',
      studentName: 'Jack W.',
      description: 'Provide digital graphic organiser via iPad instead of paper worksheet.',
      checked: false,
    },
    {
      id: 'en-5',
      category: 'PARTICIPATION',
      categoryColor: 'bg-amber-100 text-amber-700',
      studentId: 'maya',
      studentName: 'Maya R.',
      description: 'Pair Maya with a reading buddy for the annotation activity.',
      checked: true,
    },
    {
      id: 'en-6',
      category: 'ASSESSMENT',
      categoryColor: 'bg-purple-100 text-purple-700',
      studentId: 'jack',
      studentName: 'Jack W.',
      description: 'Reduce written output expectation — focus on planning scaffold only.',
      checked: false,
    },
  ],

  'science-foodchains': [
    {
      id: 'sf-1',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'liam',
      studentName: 'Liam T.',
      description: 'Provide a printed lesson agenda at the start of the session.',
      checked: true,
    },
    {
      id: 'sf-2',
      category: 'TECHNOLOGY',
      categoryColor: 'bg-green-100 text-green-700',
      studentId: 'sofia',
      studentName: 'Sofia M.',
      description: 'Enable closed captions on the ecosystem video before playing.',
      checked: false,
    },
    {
      id: 'sf-3',
      category: 'PARTICIPATION',
      categoryColor: 'bg-amber-100 text-amber-700',
      studentId: 'liam',
      studentName: 'Liam T.',
      description: 'Give Liam a 3-minute verbal warning before transitioning between tasks.',
      checked: false,
    },
    {
      id: 'sf-4',
      category: 'MATERIALS',
      categoryColor: 'bg-blue-100 text-blue-700',
      studentId: 'sofia',
      studentName: 'Sofia M.',
      description: 'Seat Sofia at the front and ensure the teacher faces her when speaking.',
      checked: true,
    },
    {
      id: 'sf-5',
      category: 'ASSESSMENT',
      categoryColor: 'bg-purple-100 text-purple-700',
      studentId: 'liam',
      studentName: 'Liam T.',
      description: 'Allow digital diagram submission with a consistent template layout.',
      checked: false,
    },
  ],
}

// ─── Weekly summary stats ─────────────────────────────────────────────────────

export const weeklyAdjustmentStats = [
  { studentId: 'maya',  items: 6, lessons: 2, barColor: '#3B82F6', barWidth: '60%' },
  { studentId: 'liam',  items: 6, lessons: 2, barColor: '#7C3AED', barWidth: '60%' },
  { studentId: 'priya', items: 3, lessons: 1, barColor: '#D97706', barWidth: '30%' },
  { studentId: 'jack',  items: 3, lessons: 1, barColor: '#EC4899', barWidth: '30%' },
  { studentId: 'sofia', items: 2, lessons: 1, barColor: '#10B981', barWidth: '20%' },
]

export const topAdjustmentTypes = [
  { category: 'Visual',     Maya: 3, Liam: 1, Priya: 0, Jack: 2 },
  { category: 'Extra Time', Maya: 1, Liam: 0, Priya: 1, Jack: 1 },
  { category: 'Breaks',     Maya: 0, Liam: 1, Priya: 2, Jack: 0 },
  { category: 'Aids',       Maya: 2, Liam: 2, Priya: 0, Jack: 0 },
]
