import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveTraffic from './pages/LiveTraffic';
import LiveMap from './pages/LiveMap';
import ReportIncident from './pages/ReportIncident';
import SmartHub from './pages/SmartHub';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="app-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/live-traffic" element={<LiveTraffic />} />
              <Route path="/live-map" element={<LiveMap />} />
              <Route path="/report-incident" element={<ProtectedRoute roles={['Commuter', 'Driver']}><ReportIncident /></ProtectedRoute>} />
              <Route path="/smart-hub" element={<SmartHub />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
