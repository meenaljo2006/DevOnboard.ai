// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
// import Login from './pages/Login'; 
// import Signup from './pages/Signup';

function App() {
  // 🟢 Future logic: Yahan hum check karenge user logged in hai ya nahi
  const isAuthenticated = true; // Temporary true for testing

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard - Protected Route (Logic baad mein add karenge) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Auth Routes (Abhi ke liye placeholders) */}
        <Route path="/login" element={<div className="h-screen flex items-center justify-center">Login Page Coming Soon</div>} />
        <Route path="/signup" element={<div className="h-screen flex items-center justify-center">Signup Page Coming Soon</div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;