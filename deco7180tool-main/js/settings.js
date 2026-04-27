const profileContent = document.getElementById('profile-card-content')
const editProfileButton = document.getElementById('edit-profile-btn')
const successBanner = document.getElementById('settings-success')

let profileState = window.AdjustStore.getTeacherProfile()
let draftProfileState = { ...profileState }
let isEditingProfile = false
let successTimerId = null

window.adjustTeacherProfile = { ...profileState }

function getInitials(name) {
  return window.AdjustStore.makeInitials(name)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function hideSuccess() {
  successBanner.hidden = true
}

function showSuccess() {
  successBanner.hidden = false
  window.clearTimeout(successTimerId)
  successTimerId = window.setTimeout(hideSuccess, 2600)
}

function renderReadOnlyProfile() {
  const initials = getInitials(profileState.fullName)
  const safeProfile = Object.fromEntries(
    Object.entries(profileState).map(([key, value]) => [key, escapeHtml(value)])
  )

  profileContent.innerHTML = `
    <div class="flex items-start gap-4">
      <div class="w-14 h-14 rounded-[1.2rem] bg-[#059669] flex items-center justify-center text-base font-bold text-white flex-shrink-0 shadow-[0_8px_20px_rgba(5,150,105,0.2)]">${initials}</div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-base font-semibold text-gray-900">${safeProfile.fullName}</p>
          <span class="settings-pill">${safeProfile.role}</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">${safeProfile.email}</p>
      </div>
    </div>
    <div class="settings-profile-grid mt-6">
      <div>
        <p class="field-label">Year level</p>
        <p class="settings-value">${safeProfile.yearLevel}</p>
        <p class="settings-subvalue">Active teaching cohort</p>
      </div>
      <div>
        <p class="field-label">Class group</p>
        <p class="settings-value">${safeProfile.classGroup}</p>
        <p class="settings-subvalue">Primary class shown in Adjust</p>
      </div>
      <div class="full-span">
        <p class="field-label">Profile status</p>
        <p class="settings-value">Ready for planning</p>
        <p class="settings-subvalue">Your lesson workspace uses these details for personalization.</p>
      </div>
    </div>
  `
}

function renderEditProfile() {
  const safeDraft = Object.fromEntries(
    Object.entries(draftProfileState).map(([key, value]) => [key, escapeHtml(value)])
  )

  profileContent.innerHTML = `
    <form id="profile-edit-form" class="space-y-5">
      <div class="settings-profile-grid">
        <div class="full-span">
          <label class="field-label" for="full-name">Full name</label>
          <input id="full-name" name="fullName" class="input-shell" value="${safeDraft.fullName}" />
        </div>
        <div>
          <label class="field-label" for="role">Role</label>
          <input id="role" name="role" class="input-shell" value="${safeDraft.role}" />
        </div>
        <div>
          <label class="field-label" for="year-level">Year level</label>
          <input id="year-level" name="yearLevel" class="input-shell" value="${safeDraft.yearLevel}" />
        </div>
        <div>
          <label class="field-label" for="class-group">Class group</label>
          <input id="class-group" name="classGroup" class="input-shell" value="${safeDraft.classGroup}" />
        </div>
        <div class="full-span">
          <label class="field-label" for="email">Email</label>
          <input id="email" name="email" type="email" class="input-shell" value="${safeDraft.email}" />
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" id="cancel-profile-btn" class="btn-ghost">Cancel</button>
        <button type="submit" class="btn-solid">Save changes</button>
      </div>
    </form>
  `

  const form = document.getElementById('profile-edit-form')
  const cancelButton = document.getElementById('cancel-profile-btn')

  form.addEventListener('input', (event) => {
    const { name, value } = event.target
    draftProfileState = {
      ...draftProfileState,
      [name]: value,
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    profileState = window.AdjustStore.saveTeacherProfile({
      ...draftProfileState,
    })

    window.adjustTeacherProfile = { ...profileState }
    renderSidebar('settings')
    isEditingProfile = false
    renderProfileCard()
    showSuccess()
  })

  cancelButton.addEventListener('click', () => {
    draftProfileState = { ...profileState }
    isEditingProfile = false
    renderProfileCard()
  })
}

function renderProfileCard() {
  editProfileButton.hidden = isEditingProfile

  if (isEditingProfile) {
    renderEditProfile()
    document.getElementById('full-name')?.focus()
    return
  }

  renderReadOnlyProfile()
}

editProfileButton.addEventListener('click', () => {
  hideSuccess()
  draftProfileState = { ...profileState }
  isEditingProfile = true
  renderProfileCard()
})

renderProfileCard()
