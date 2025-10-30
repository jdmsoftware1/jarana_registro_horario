import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeKioskPage from './pages/EmployeeKioskPage';
import EmployeePortal from './pages/EmployeePortal';

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<HomePage />} />
          
          {/* Portal del empleado */}
          <Route path="/employee-portal" element={<EmployeePortal />} />
          
          {/* Kiosk de fichaje */}
          <Route path="/employee-kiosk" element={<EmployeeKioskPage />} />
          
          {/* Dashboard administrativo */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;
