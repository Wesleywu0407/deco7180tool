import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { lessons } from '../data/lessons.js'
import { students, getStudentById } from '../data/students.js'
import { adjustmentsByLesson } from '../data/adjustments.js'

// ─── Icons ────────────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// ─── Student roster card ──────────────────────────────────────────────────────
function RosterCard({ student, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(student.id)}
      className={`p-3 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-[#1D9E75] bg-[#e6f7f2]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`avatar w-8 h-8 text-xs ${student.avatarClass}`}>
          {student.initials}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${selected ? 'text-[#1D9E75]' : 'text-gray-800'}`}>
            {student.name}
          </p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {student.needs.map((n) => (
              <span key={n.label} className={`tag text-[10px] py-0 ${n.colorClass}`}>
                {n.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Adjustment card ──────────────────────────────────────────────────────────
function AdjustmentCard({ adjustment, onToggle }) {
  return (
    <div
      className={`card border p-4 transition-opacity ${
        adjustment.checked ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`tag text-[10px] mb-1 ${adjustment.categoryColor}`}>
            {adjustment.category}
          </span>
          <p className="text-xs font-semibold text-gray-700 mt-1 mb-1">{adjustment.studentName}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{adjustment.description}</p>
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(adjustment.id)}
          className="flex-shrink-0 mt-0.5"
          aria-label={adjustment.checked ? 'Uncheck adjustment' : 'Check adjustment'}
        >
          {adjustment.checked ? (
            <div className="w-5 h-5 rounded bg-[#1D9E75] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded border-2 border-gray-300 hover:border-[#1D9E75] transition-colors" />
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LessonPlanner() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const lesson = lessons.find((l) => l.id === lessonId)

  // All students in roster (use all 5 for the planner)
  const roster = students

  // Initially selected students match the lesson's studentIds
  const [selectedIds, setSelectedIds] = useState(lesson ? lesson.studentIds : [])

  // Adjustment state (initialised from data file)
  const rawAdjustments = adjustmentsByLesson[lessonId] || []
  const [adjustments, setAdjustments] = useState(rawAdjustments)

  // When selected students change, filter adjustments to match
  const visibleAdjustments = adjustments.filter((a) => selectedIds.includes(a.studentId))

  const checkedCount = visibleAdjustments.filter((a) => a.checked).length
  const totalCount = visibleAdjustments.length
  const progressPct = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100)

  function toggleStudent(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function toggleAdjustment(id) {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Lesson not found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:h-full md:min-h-0">
      <TopBar title="Lesson Planner">
        <button className="btn-text text-sm font-medium text-gray-600">Export</button>
        <button className="btn-primary text-sm rounded-full px-5">Share</button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><BellIcon /></button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><MenuIcon /></button>
      </TopBar>

      {/* 3-column layout */}
      <div className="flex flex-1 flex-col gap-4 overflow-visible p-4 md:flex-row md:gap-0 md:overflow-hidden md:p-0">

        {/* ── LEFT: Class Roster ──────────────────────────────────────── */}
        <aside className="w-full flex-shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-5 space-y-2 scrollbar-thin md:w-[260px] md:overflow-y-auto md:rounded-none md:border-0 md:border-r">
          <p className="section-label">Class roster</p>
          {roster.map((s) => (
            <RosterCard
              key={s.id}
              student={s}
              selected={selectedIds.includes(s.id)}
              onToggle={toggleStudent}
            />
          ))}
        </aside>

        {/* ── MIDDLE: Lesson Context ──────────────────────────────────── */}
        <section className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-5 scrollbar-thin md:overflow-y-auto md:rounded-none md:border-0 md:bg-transparent md:px-6">
          <p className="section-label">Lesson context</p>

          {/* Lesson card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {lesson.subject} · {lesson.year}
            </p>
            <h2 className="text-base font-semibold text-gray-900 mb-2">{lesson.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CalendarIcon />
              <span>{lesson.schedule}</span>
            </div>
          </div>

          {/* Learning goals */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Learning goals</p>
            <p className="text-sm text-gray-600 leading-relaxed">{lesson.goals}</p>
          </div>

          {/* Assessment */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Assessment</p>
            <p className="text-sm text-gray-600 leading-relaxed">{lesson.assessment}</p>
          </div>

          {/* Adjusting for */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Adjusting for</p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No students selected</p>
              ) : (
                selectedIds.map((sid) => {
                  const s = getStudentById(sid)
                  if (!s) return null
                  return (
                    <div
                      key={sid}
                      className="flex items-center gap-1.5 px-3 py-1 border border-[#1D9E75] rounded-full"
                    >
                      <div className={`w-5 h-5 rounded-full ${s.avatarClass} flex items-center justify-center text-[9px] font-bold text-white`}>
                        {s.initials}
                      </div>
                      <span className="text-xs font-medium text-[#1D9E75]">{s.name}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Save button */}
          <button className="w-full btn-primary justify-center py-3 text-sm rounded-xl font-bold tracking-wide">
            SAVE LESSON PLAN
          </button>
        </section>

        {/* ── RIGHT: Suggested Adjustments ───────────────────────────── */}
        <aside className="w-full flex-shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-5 flex flex-col scrollbar-thin md:w-[280px] md:overflow-y-auto md:rounded-none md:border-0 md:border-l">
          <p className="section-label">Suggested adjustments</p>

          <div className="flex-1 space-y-3">
            {visibleAdjustments.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center mt-8">
                Select students from the roster to see suggested adjustments.
              </p>
            ) : (
              visibleAdjustments.map((adj) => (
                <AdjustmentCard
                  key={adj.id}
                  adjustment={adj}
                  onToggle={toggleAdjustment}
                />
              ))
            )}
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                <span className="text-xs text-gray-600 font-medium">{checkedCount} / {totalCount} done</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
