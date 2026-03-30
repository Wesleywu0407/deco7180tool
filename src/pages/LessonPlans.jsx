import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { lessons } from '../data/lessons.js'
import { students, getStudentById } from '../data/students.js'

// ─── Clock icon ───────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  )
}

// ─── Lesson card ─────────────────────────────────────────────────────────────
function LessonCard({ lesson, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-md hover:border-[#1D9E75] transition-all group"
    >
      {/* Subject tag */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {lesson.subject} · {lesson.year}
      </p>

      {/* Lesson title */}
      <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-3 group-hover:text-[#1D9E75] transition-colors">
        {lesson.title}
      </h3>

      {/* Schedule */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <ClockIcon />
        <span>{lesson.schedule}</span>
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* Footer: avatars + adjustment count */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {lesson.studentIds.map((sid) => {
            const s = getStudentById(sid)
            if (!s) return null
            return (
              <div
                key={sid}
                className={`avatar w-7 h-7 text-[10px] ring-2 ring-white ${s.avatarClass}`}
                title={s.name}
              >
                {s.initials}
              </div>
            )
          })}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {lesson.adjustmentCount} adjustments
        </span>
      </div>
    </div>
  )
}

// ─── Add new card ─────────────────────────────────────────────────────────────
function AddLessonCard() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1D9E75] hover:bg-[#e6f7f2] transition-all min-h-[160px] group">
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-[#1D9E75] flex items-center justify-center text-gray-400 group-hover:text-[#1D9E75] transition-colors text-lg font-light">
        +
      </div>
      <p className="text-sm text-gray-400 group-hover:text-[#1D9E75] transition-colors font-medium">
        Add new lesson
      </p>
    </div>
  )
}

// ─── Recommendation banner ────────────────────────────────────────────────────
function RecommendationBanner({ onDismiss }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-start gap-4">
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 mb-0.5">Recommended Adjustments</p>
        <p className="text-sm text-gray-600">
          Based on Liam's recent sensory assessment, consider providing a noise-cancelling headset option for Thursday's Science ecosystem video.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="btn-primary text-xs py-1.5 px-3">APPLY TO LESSON</button>
        <button onClick={onDismiss} className="btn-text text-xs">Dismiss</button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LessonPlans() {
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div>
      <TopBar
        title="This week's lesson plans"
        subtitle="4 lessons · 5 SEN students"
      >
        <button className="btn-outline text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export adjustments
        </button>
        <button className="btn-primary text-sm">+ New lesson</button>
      </TopBar>

      <div className="px-8 py-6 space-y-6">
        {/* Section label */}
        <p className="section-label">This week's lessons</p>

        {/* Card grid */}
        <div className="grid grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={() => navigate(`/lessons/${lesson.id}`)}
            />
          ))}
          <AddLessonCard />
        </div>

        {/* Recommendation banner */}
        {showBanner && (
          <RecommendationBanner onDismiss={() => setShowBanner(false)} />
        )}
      </div>
    </div>
  )
}
