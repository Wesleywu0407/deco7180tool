// ─── Student Profiles page ────────────────────────────────────────────────────

renderSidebar('students')

function renderProfiles() {
  const grid = document.getElementById('profiles-grid')

  grid.innerHTML = STUDENTS.map(s => {
    const needTags = s.needs.map(n =>
      `<span class="tag" style="background:${n.bg};color:${n.text}">${n.label}</span>`
    ).join('')

    const strategies = s.strategies.map(str =>
      `<li class="flex items-start gap-2 text-sm text-gray-600">
        <span style="width:8px;height:8px;border-radius:9999px;background:#1D9E75;flex-shrink:0;margin-top:6px;display:inline-block"></span>
        <span>${str}</span>
      </li>`
    ).join('')

    return `
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="avatar" style="width:48px;height:48px;font-size:14px;background:${s.avatarBg}">${s.initials}</div>
          <div>
            <p class="text-base font-semibold text-gray-900">${s.name}</p>
            <p class="text-xs text-gray-400 mt-0.5">${s.year} · ${s.cls}</p>
          </div>
        </div>

        <!-- Learning needs -->
        <div class="mb-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Learning needs</p>
          <div class="flex flex-wrap gap-1.5">${needTags}</div>
        </div>

        <!-- Teacher notes -->
        <div class="mb-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Teacher notes</p>
          <p class="text-sm text-gray-600 leading-relaxed">${s.notes}</p>
        </div>

        <!-- Strategies -->
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Common strategies</p>
          <ul class="space-y-1.5">${strategies}</ul>
        </div>
      </div>`
  }).join('')
}

renderProfiles()
