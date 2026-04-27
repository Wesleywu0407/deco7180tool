import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import LessonPlans from './pages/LessonPlans.jsx'
import LessonPlanner from './pages/LessonPlanner.jsx'
import StudentProfiles from './pages/StudentProfiles.jsx'
import WeeklySummary from './pages/WeeklySummary.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F3F4F6] md:h-screen md:overflow-hidden">
        <Sidebar />

        {/* Main content scrollable area */}
        <main className="flex-1 min-w-0 pb-20 md:ml-[220px] md:min-h-0 md:overflow-y-auto md:pb-0 md:overscroll-contain">
          <Routes>
            <Route path="/" element={<Navigate to="/lessons" replace />} />
            <Route path="/lessons" element={<LessonPlans />} />
            <Route path="/lessons/:lessonId" element={<LessonPlanner />} />
            <Route path="/students" element={<StudentProfiles />} />
            <Route path="/summary" element={<WeeklySummary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
