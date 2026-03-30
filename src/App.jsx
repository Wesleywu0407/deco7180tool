import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import LessonPlans from './pages/LessonPlans.jsx'
import LessonPlanner from './pages/LessonPlanner.jsx'
import StudentProfiles from './pages/StudentProfiles.jsx'
import WeeklySummary from './pages/WeeklySummary.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />

        {/* Main content scrollable area */}
        <main className="ml-[200px] flex-1 overflow-y-auto">
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
