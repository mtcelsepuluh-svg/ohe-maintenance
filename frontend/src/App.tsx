import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import InputOHE from './pages/InputOHE';
import Reports from './pages/Reports';
import WorkTimeSheetPage from './pages/WorkTimeSheet';
import MekanikManagement from './pages/MekanikManagement';
import { authService } from './services/authService';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Navbar />}
        <div className={isAuthenticated ? 'main-content' : ''}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <Activities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/input"
              element={
                <ProtectedRoute>
                  <InputOHE />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worktime"
              element={
                <ProtectedRoute>
                  <WorkTimeSheetPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mekaniks"
              element={
                <ProtectedRoute>
                  <MekanikManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
