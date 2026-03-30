// ─── Lesson data ──────────────────────────────────────────────────────────────
// All lesson metadata used across the app.

export const lessons = [
  {
    id: 'math-fractions',
    subject: 'MATHEMATICS',
    year: 'YEAR 5',
    title: 'Adding fractions with unlike denominators',
    schedule: 'Tuesday period 2 · 60 min',
    studentIds: ['maya', 'liam', 'priya'],
    adjustmentCount: 9,
    goals:
      'Students will identify the lowest common denominator, convert fractions, and solve addition problems accurately.',
    assessment:
      'Written worked examples and an exit slip completed before the end of the lesson.',
    subjectColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'english-narrative',
    subject: 'ENGLISH',
    year: 'YEAR 5',
    title: 'Narrative writing structure',
    schedule: 'Wednesday period 1 · 60 min',
    studentIds: ['maya', 'jack'],
    adjustmentCount: 6,
    goals:
      'Students will plan a narrative using an orientation–complication–resolution structure and begin drafting their opening.',
    assessment:
      'A written planning scaffold submitted at the end of the lesson.',
    subjectColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'science-foodchains',
    subject: 'SCIENCE',
    year: 'YEAR 5',
    title: 'Food chains and ecosystems',
    schedule: 'Thursday period 3 · 50 min',
    studentIds: ['liam', 'sofia'],
    adjustmentCount: 5,
    goals:
      'Students will construct a food chain diagram and explain energy transfer between producers and consumers.',
    assessment:
      'A labelled diagram and a short written explanation submitted digitally.',
    subjectColor: 'bg-amber-100 text-amber-700',
  },
]
