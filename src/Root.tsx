import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { BranchProvider } from './hooks/useBranch';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function Root() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BranchProvider>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<App />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BranchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
