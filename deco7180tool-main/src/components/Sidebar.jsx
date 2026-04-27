import { NavLink } from 'react-router-dom'

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
  const openFeedback = (event) => {
    if (window.AdjustFeedback?.showRatingModal) {
      event.preventDefault()
      window.AdjustFeedback.showRatingModal()
    }
  }

  return (
    <aside className="sidebar">
      {/* ── App brand ─────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-5 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-3">
          <div className="brand-mark" aria-hidden="true">
            <svg className="h-[1.15rem] w-[1.15rem] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 8.75a1.75 1.75 0 0 1 1.75-1.75H10a5 5 0 0 1 4 1.95V17a5 5 0 0 0-4-1.95H7.25A1.75 1.75 0 0 0 5.5 16.8v-8.05Z" fill="currentColor" stroke="none" />
              <path d="M18.5 8.75A1.75 1.75 0 0 0 16.75 7H14a5 5 0 0 0-4 1.95V17a5 5 0 0 1 4-1.95h2.75A1.75 1.75 0 0 1 18.5 16.8v-8.05Z" fill="currentColor" stroke="none" />
              <path d="M12 8.6V17" stroke="white" strokeWidth={1.2} />
              <path d="M17.45 4.1 17.95 5.35 19.2 5.85 17.95 6.35 17.45 7.6 16.95 6.35 15.7 5.85 16.95 5.35 17.45 4.1Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#111827] leading-tight">Adjust</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-tight">SEN lesson planning tool</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
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
      <div className="px-4 pb-3">
        <button onClick={() => { window.location.href = '/planner.html?new=1' }} className="w-full btn-primary justify-center py-2.5 text-sm rounded-[10px]">
          + New Plan
        </button>
      </div>

      {/* ── Footer links ─────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-[#F3F4F6] flex gap-4">
        <a href="/settings.html" className="text-xs text-[#9CA3AF] hover:text-[#111827] transition-colors">Settings</a>
        <a href="/support.html" className="text-xs text-[#9CA3AF] hover:text-[#111827] transition-colors">Support</a>
      </div>

      <div className="px-4 pb-2">
        <a href="/support.html" onClick={openFeedback} className="sidebar-feedback-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Share feedback</span>
        </a>
      </div>

      {/* ── Teacher info ─────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-[#F3F4F6] flex items-center gap-3">
        <div className="avatar avatar-teal text-xs flex-shrink-0">MC</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#111827] truncate">Mrs. Chen · Year 5</p>
          <p className="text-[11px] text-[#9CA3AF] truncate">Week 9 · Term 2</p>
        </div>
      </div>
    </aside>
  )
}
