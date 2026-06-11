import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const isAuthenticated = true; 

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard - Protected Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Auth Routes*/}
        <Route path="/login" element={<div className="h-screen flex items-center justify-center">Login Page Coming Soon</div>} />
        <Route path="/signup" element={<div className="h-screen flex items-center justify-center">Signup Page Coming Soon</div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;