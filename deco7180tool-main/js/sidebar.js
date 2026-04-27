// ─── Sidebar renderer ─────────────────────────────────────────────────────────
// Call renderSidebar('lessons' | 'students' | 'summary' | 'settings' | 'support')

function renderSidebar(activePage) {
  const teacher = window.adjustTeacherProfile || {
    fullName: 'Mrs. Chen',
    role: 'SEN Specialist',
    yearLevel: 'Year 5',
    classGroup: 'Class 5B',
  }
  const teacherInitials = teacher.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const mainNav = [
    {
      id: 'lessons', label: 'Lesson plans', href: 'index.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    },
    {
      id: 'students', label: 'Student profiles', href: 'students.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    },
    {
      id: 'summary', label: 'Weekly summary', href: 'summary.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    },
  ]

  const footerNav = [
    {
      id: 'settings', label: 'Settings', href: 'settings.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    },
    {
      id: 'support', label: 'Support', href: 'support.html',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    },
  ]

  function navLink(item) {
    const isActive = item.id === activePage
    const base = 'sidebar-nav-link flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer transition-all no-underline'
    const state = isActive
      ? 'bg-[#ECFDF5] text-[#059669] font-semibold'
      : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
    return `<a href="${item.href}" class="${base} ${state}">${item.icon}<span>${item.label}</span></a>`
  }

  const html = `
    <aside style="width:220px;min-width:220px" class="fixed top-0 left-0 h-screen bg-white border-r border-[#F3F4F6] flex flex-col z-30">
      <!-- Brand -->
      <div class="px-4 pt-5 pb-5 border-b border-[#F3F4F6]">
        <a href="index.html" title="Go to home" style="text-decoration:none;display:flex;align-items:center;gap:10px;padding:4px;border-radius:10px;transition:background 0.15s" onmouseenter="this.style.background='rgba(0,0,0,0.04)'" onmouseleave="this.style.background='transparent'">
          <div class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5.5 8.75a1.75 1.75 0 0 1 1.75-1.75H10a5 5 0 0 1 4 1.95V17a5 5 0 0 0-4-1.95H7.25A1.75 1.75 0 0 0 5.5 16.8v-8.05Z" fill="currentColor" stroke="none"/>
              <path d="M18.5 8.75A1.75 1.75 0 0 0 16.75 7H14a5 5 0 0 0-4 1.95V17a5 5 0 0 1 4-1.95h2.75A1.75 1.75 0 0 1 18.5 16.8v-8.05Z" fill="currentColor" stroke="none"/>
              <path d="M12 8.6V17" stroke="white" stroke-width="1.2"/>
              <path d="M17.45 4.1 17.95 5.35 19.2 5.85 17.95 6.35 17.45 7.6 16.95 6.35 15.7 5.85 16.95 5.35 17.45 4.1Z" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div>
            <p class="text-[18px] font-bold text-[#111827] leading-tight">Adjust</p>
            <p class="text-[11px] text-[#9CA3AF] mt-0.5 leading-tight">SEN lesson planning tool</p>
          </div>
        </a>
      </div>

      <!-- Main nav -->
      <nav class="flex-1 px-2 py-4 space-y-0.5">
        ${mainNav.map(navLink).join('')}
      </nav>

      <!-- New Plan -->
      <div class="px-4 pb-3">
        <button onclick="location.href='planner.html?new=1'" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#059669] text-white text-sm font-medium rounded-[10px] hover:bg-[#047857] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          + New Plan
        </button>
      </div>

      <!-- Footer nav: Settings + Support -->
      <div class="px-2 py-3 border-t border-[#F3F4F6] space-y-0.5">
        ${footerNav.map(navLink).join('')}
      </div>

      <!-- Share feedback -->
      <div class="px-4 pb-2">
        <a href="support.html" class="sidebar-feedback-link" data-feedback-link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01
                 M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20
                 l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>Share feedback</span>
        </a>
      </div>

      <!-- Teacher -->
      <div class="px-4 py-4 border-t border-[#F3F4F6] flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">${teacherInitials}</div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-[#111827] truncate">${teacher.fullName} · ${teacher.yearLevel}</p>
          <p class="text-[11px] text-[#9CA3AF] truncate">${teacher.classGroup} · ${teacher.role}</p>
        </div>
      </div>
    </aside>
  `
  const sidebarRoot = document.getElementById('sidebar')
  sidebarRoot.innerHTML = html

  const feedbackLink = sidebarRoot.querySelector('[data-feedback-link]')
  if (feedbackLink) {
    feedbackLink.addEventListener('click', (event) => {
      if (window.AdjustFeedback?.showRatingModal) {
        event.preventDefault()
        window.AdjustFeedback.showRatingModal()
      }
    })
  }
}
