import TopBar from '../components/TopBar.jsx'
import { students } from '../data/students.js'

// ─── Icon buttons ─────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ─── Student profile card ─────────────────────────────────────────────────────
function ProfileCard({ student }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${student.avatarClass} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {student.initials}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{student.year} · {student.className}</p>
        </div>
      </div>

      {/* Learning needs */}
      <div className="mb-4">
        <p className="section-label mb-2">Learning needs</p>
        <div className="flex flex-wrap gap-1.5">
          {student.needs.map((n) => (
            <span key={n.label} className={`tag ${n.colorClass}`}>{n.label}</span>
          ))}
        </div>
      </div>

      {/* Teacher notes */}
      <div className="mb-4">
        <p className="section-label mb-2">Teacher notes</p>
        <p className="text-sm text-gray-600 leading-relaxed">{student.notes}</p>
      </div>

      {/* Common strategies */}
      <div>
        <p className="section-label mb-2">Common strategies</p>
        <ul className="space-y-1.5">
          {student.strategies.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              {/* Green bullet */}
              <span className="w-2 h-2 rounded-full bg-[#1D9E75] flex-shrink-0 mt-1.5" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentProfiles() {
  return (
    <div>
      <TopBar
        title="SEN student profiles"
        subtitle="5 SEN students in this class"
      >
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search profiles..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent w-44"
          />
        </div>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><BellIcon /></button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><SettingsIcon /></button>
        <div className="avatar avatar-teal w-8 h-8 text-xs">MC</div>
      </TopBar>

      <div className="px-8 py-6">
        {/* Page heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">SEN student profiles</h2>
          <p className="text-sm text-gray-500 mt-1">Manage individual support plans and classroom strategies.</p>
        </div>

        {/* 2-column card grid */}
        <div className="grid grid-cols-2 gap-5">
          {students.map((student) => (
            <ProfileCard key={student.id} student={student} />
          ))}
        </div>
      </div>
    </div>
  )
}
