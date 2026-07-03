import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetails from './pages/ComplaintDetails';
import NoticesPage from './pages/NoticesPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'ADMIN' 
    ? <Navigate to="/admin/dashboard" replace /> 
    : <Navigate to="/resident/dashboard" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<RootRedirect />} />
              
              {/* Resident Only */}
              <Route path="resident/dashboard" element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ResidentDashboard />
                </ProtectedRoute>
              } />
              <Route path="complaints" element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ComplaintsList />
                </ProtectedRoute>
              } />

              {/* Admin Only */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/complaints" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ComplaintsList />
                </ProtectedRoute>
              } />

              {/* Shared Protected Routes */}
              <Route path="complaints/:id" element={<ComplaintDetails />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
