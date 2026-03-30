import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import TopBar from '../components/TopBar.jsx'
import { students, getStudentById } from '../data/students.js'
import { weeklyAdjustmentStats, topAdjustmentTypes } from '../data/adjustments.js'

// ─── Need icon (per student colour) ──────────────────────────────────────────
const NEED_ICONS = {
  blue: (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  purple: (
    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  amber: (
    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  pink: (
    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  green: (
    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
    </svg>
  ),
}

const ICON_BG = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  amber: 'bg-amber-100',
  pink: 'bg-pink-100',
  green: 'bg-green-100',
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ number, label }) {
  return (
    <div className="bg-[#F5F5F0] rounded-xl p-6 flex flex-col items-start">
      <span className="text-4xl font-bold text-[#1D9E75] leading-none mb-2">{number}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ─── Student adjustment row ───────────────────────────────────────────────────
function AdjustmentRow({ stat }) {
  const student = getStudentById(stat.studentId)
  if (!student) return null

  return (
    <div className="card flex items-center gap-4">
      {/* Icon + name */}
      <div className="flex items-center gap-3 w-52 flex-shrink-0">
        <div className={`w-9 h-9 rounded-full ${ICON_BG[student.color]} flex items-center justify-center flex-shrink-0`}>
          {NEED_ICONS[student.color]}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{student.name}</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {student.needs.map((n) => (
              <span key={n.label} className={`tag text-[10px] py-0 ${n.colorClass}`}>{n.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Items · lessons */}
      <p className="text-sm text-gray-500 w-36 flex-shrink-0">
        {stat.items} items · {stat.lessons} {stat.lessons === 1 ? 'lesson' : 'lessons'}
      </p>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: stat.barWidth, backgroundColor: stat.barColor }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">{stat.barWidth}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WeeklySummary() {
  return (
    <div>
      <TopBar title="Weekly summary" subtitle="WEEK 9 · TERM 2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search insights..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent w-44"
          />
        </div>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </TopBar>

      <div className="px-8 py-6 space-y-6">

        {/* ── Row 1: Stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard number="4"  label="Lessons this week" />
          <StatCard number="5"  label="SEN students" />
          <StatCard number="20" label="Total adjustments" />
        </div>

        {/* ── Adjustments per student ────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label mb-0">Adjustments per student</p>
            <button className="text-xs font-semibold text-[#1D9E75] hover:underline">
              EXPORT REPORT ↗
            </button>
          </div>

          <div className="space-y-2.5">
            {weeklyAdjustmentStats.map((stat) => (
              <AdjustmentRow key={stat.studentId} stat={stat} />
            ))}
          </div>
        </div>

        {/* ── Bottom two columns ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-5">

          {/* LEFT: Top adjustment types chart */}
          <div className="card">
            <p className="section-label mb-4">Top adjustment types</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAdjustmentTypes} margin={{ top: 0, right: 8, left: -20, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Maya"  fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Liam"  fill="#7C3AED" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Priya" fill="#D97706" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Jack"  fill="#EC4899" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RIGHT: Focus areas for Week 10 */}
          <div className="bg-[#1D9E75] rounded-xl p-6 flex flex-col justify-between">
            <div>
              {/* Lightbulb icon */}
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">
                Focus areas for Week 10
              </p>

              <h3 className="text-lg font-bold text-white leading-snug mb-3">
                Prioritise visual scaffolds for the upcoming Geometry block.
              </h3>

              <p className="text-sm text-white/80">
                Impacts 3 students (Maya, Jack, Sofia)
              </p>
            </div>

            <div className="mt-6">
              <button className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold px-4 py-2 rounded-lg">
                View geometry unit →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
