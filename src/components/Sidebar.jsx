import { NavLink, useNavigate } from 'react-router-dom'

// ─── Nav item config ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    path: '/lessons',
    label: 'Lesson plans',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: '/students',
    label: 'Student profiles',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/summary',
    label: 'Weekly summary',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* ── App brand ─────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <p className="text-base font-bold text-gray-900 leading-tight">Adjust</p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">SEN lesson planning tool</p>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── New Plan button ───────────────────────────────── */}
      <div className="px-3 pb-3">
        <button className="w-full btn-primary justify-center py-2 text-xs rounded-lg">
          + New Plan
        </button>
      </div>

      {/* ── Footer links ─────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-gray-100 flex gap-4">
        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Settings</button>
        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Support</button>
      </div>

      {/* ── Teacher info ─────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="avatar avatar-teal text-xs flex-shrink-0">MC</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">Mrs. Chen · Year 5</p>
          <p className="text-[11px] text-gray-400 truncate">Week 9 · Term 2</p>
        </div>
      </div>
    </aside>
  )
}
