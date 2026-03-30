// ─── Sidebar renderer ─────────────────────────────────────────────────────────
// Call renderSidebar('lessons' | 'students' | 'summary') on each page.

function renderSidebar(activePage) {
  const nav = [
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

  const navHTML = nav.map(item => {
    const isActive = item.id === activePage
    const baseClass = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors no-underline'
    const activeClass = isActive
      ? 'bg-[#e6f7f2] text-[#1D9E75] font-semibold'
      : 'text-gray-600 hover:bg-gray-50'
    return `<a href="${item.href}" class="${baseClass} ${activeClass}">${item.icon}<span>${item.label}</span></a>`
  }).join('')

  const html = `
    <aside style="width:200px;min-width:200px" class="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-30">
      <!-- Brand -->
      <div class="px-5 pt-6 pb-5 border-b border-gray-100">
        <p class="text-base font-bold text-gray-900 leading-tight">Adjust</p>
        <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">SEN lesson planning tool</p>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5">${navHTML}</nav>

      <!-- New Plan -->
      <div class="px-3 pb-3">
        <button class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-xs font-semibold rounded-lg hover:bg-[#178a63] transition-colors">
          + New Plan
        </button>
      </div>

      <!-- Footer links -->
      <div class="px-5 py-3 border-t border-gray-100 flex gap-4">
        <button class="text-xs text-gray-400 hover:text-gray-600 transition-colors">Settings</button>
        <button class="text-xs text-gray-400 hover:text-gray-600 transition-colors">Support</button>
      </div>

      <!-- Teacher -->
      <div class="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">MC</div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-gray-800 truncate">Mrs. Chen · Year 5</p>
          <p class="text-[11px] text-gray-400 truncate">Week 9 · Term 2</p>
        </div>
      </div>
    </aside>
  `
  document.getElementById('sidebar').innerHTML = html
}
