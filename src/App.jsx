import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainDisplay from './components/MainDisplay'
import InputPage from './components/InputPage'
import OverviewPage from './components/OverviewPage'
import PaddleTracker from './components/PaddleTracker'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<MainDisplay />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/tracker" element={<PaddleTracker />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
