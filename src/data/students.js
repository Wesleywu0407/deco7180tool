// ─── Central student data store ───────────────────────────────────────────────
// All student profiles, needs, notes and classroom strategies live here.

export const students = [
  {
    id: 'maya',
    initials: 'MR',
    name: 'Maya R.',
    color: 'blue',
    avatarClass: 'avatar-blue',
    needs: [{ label: 'Dyslexia', colorClass: 'tag-blue' }],
    year: 'Year 5',
    className: 'Class 5B',
    notes:
      "Maya's decoding is weaker but her verbal reasoning and logic are strong. Prioritise visual supports over dense text.",
    strategies: [
      'Replace text instructions with visual diagrams',
      'Provide colour-coded worked examples',
      'Allow oral response instead of written assessment',
    ],
  },
  {
    id: 'liam',
    initials: 'LT',
    name: 'Liam T.',
    color: 'purple',
    avatarClass: 'avatar-purple',
    needs: [{ label: 'ASD', colorClass: 'tag-purple' }],
    year: 'Year 5',
    className: 'Class 5B',
    notes:
      'Liam needs clear, consistent structure. Unexpected changes cause anxiety — always give advance notice of transitions.',
    strategies: [
      'Display written lesson agenda at the start',
      'Give 3-minute verbal warning before transitions',
      'Keep worksheet layout consistent every time',
    ],
  },
  {
    id: 'priya',
    initials: 'PK',
    name: 'Priya K.',
    color: 'amber',
    avatarClass: 'avatar-amber',
    needs: [{ label: 'ADHD', colorClass: 'tag-amber' }],
    year: 'Year 5',
    className: 'Class 5B',
    notes:
      "Priya's focus window is around 10 minutes. Structured short tasks with movement breaks significantly improve engagement.",
    strategies: [
      'Break lesson into 10-min timed segments',
      'Display a visual countdown timer on the board',
      'Present steps one at a time to avoid overload',
    ],
  },
  {
    id: 'jack',
    initials: 'JW',
    name: 'Jack W.',
    color: 'pink',
    avatarClass: 'avatar-pink',
    needs: [
      { label: 'Physical', colorClass: 'tag-pink' },
      { label: 'Dyslexia', colorClass: 'tag-blue' },
    ],
    year: 'Year 5',
    className: 'Class 5B',
    notes:
      'Jack has limited upper-limb mobility making handwriting difficult, alongside dyslexia. Tech-assisted approaches work best.',
    strategies: [
      'All tasks completed via iPad with stylus',
      'Speech-to-text as alternative to written response',
      'Digital visual diagrams replacing text-heavy materials',
    ],
  },
  {
    id: 'sofia',
    initials: 'SM',
    name: 'Sofia M.',
    color: 'green',
    avatarClass: 'avatar-green',
    needs: [{ label: 'Hearing', colorClass: 'tag-green' }],
    year: 'Year 5',
    className: 'Class 5B',
    notes:
      'Sofia wears bilateral hearing aids. She relies heavily on lip-reading and written support. Ensure she is always seated at the front.',
    strategies: [
      'Seat Sofia at the front of the classroom',
      'Use written instructions alongside verbal explanations',
      'Ensure captions are enabled on all video content',
    ],
  },
]

// Helper: get student by id
export const getStudentById = (id) => students.find((s) => s.id === id)
