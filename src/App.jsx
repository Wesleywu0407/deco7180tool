import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import LessonPlans from './pages/LessonPlans.jsx'
import LessonPlanner from './pages/LessonPlanner.jsx'
import StudentProfiles from './pages/StudentProfiles.jsx'
import WeeklySummary from './pages/WeeklySummary.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">
        <Sidebar />

        {/* Main content scrollable area */}
        <main className="ml-[220px] flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
