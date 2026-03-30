// ─── Reusable top bar component ───────────────────────────────────────────────
// Props:
//   title      – main heading string
//   subtitle   – muted sub-heading string (optional)
//   children   – action buttons / icons placed on the right side

export default function TopBar({ title, subtitle, children }) {
  return (
    <header className="topbar sticky top-0 z-20">
      {/* Left: title + subtitle */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: action slot */}
      {children && (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </header>
  )
}
