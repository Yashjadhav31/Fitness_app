import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./components/Auth/Login'));
const Signup = lazy(() => import('./components/Auth/Signup'));
const ProfileSetup = lazy(() => import('./components/Auth/ProfileSetup'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Planner = lazy(() => import('./components/Planner/Planner'));

function App() {
  const bypassAuth =
    import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH !== 'false';

  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to={bypassAuth ? '/dashboard' : '/login'} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <Planner />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
