import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SettingsPage from './pages/settings/SettingsPage';
import TestDashboard from './pages/patient/TestDashboard';
import BottomNav from './components/navigation/BottomNav';
import { Pill } from 'lucide-react';
import { USER_ROLES } from './utils/constants';

// Loading Screen Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 animate-pulse">
        <Pill className="text-white" size={48} />
      </div>
      <p className="text-gray-600 font-medium text-lg">Loading...</p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

// Main App Content with Role-Based Routing
const AppContent = () => {
  const { user, loading } = useApp();
  const [authMode, setAuthMode] = useState(null); // null = landing, 'login', 'signup', 'admin'
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'settings', 'test'
  const [adminUser, setAdminUser] = useState(null);

  // Get user role from Firestore user document
  const [userRole, setUserRole] = React.useState(null);
  const [roleLoading, setRoleLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUserRole = async () => {
      if (user) {
        try {
          const { getUserData } = await import('./services/authService');
          const userData = await getUserData(user.uid);
          setUserRole(userData?.role || USER_ROLES.PATIENT);
        } catch (error) {
          console.error('Error loading user role:', error);
          setUserRole(USER_ROLES.PATIENT); // Default to patient
        } finally {
          setRoleLoading(false);
        }
      } else {
        setRoleLoading(false);
      }
    };

    loadUserRole();
  }, [user]);

  // Handle admin login
  const handleAdminLogin = (admin) => {
    setAdminUser(admin);
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setAdminUser(null);
    setAuthMode(null);
  };

  // Show admin dashboard if admin is logged in
  if (adminUser) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Show admin login if user selected admin
  if (authMode === 'admin') {
    return <AdminLoginPage onLoginSuccess={handleAdminLogin} />;
  }

  // Show loading screen while checking authentication or role
  if (loading || roleLoading) {
    return <LoadingScreen />;
  }

  // Show landing page if no auth mode selected and user not logged in
  if (!user && !authMode) {
    return (
      <LandingPage 
        onGetStarted={() => setAuthMode('signup')}
        onLogin={() => setAuthMode('login')}
      />
    );
  }

  // Show authentication pages if user is not logged in
  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginPage 
          onSignupClick={() => setAuthMode('signup')}
          onAdminClick={() => setAuthMode('admin')}
          onBackToHome={() => setAuthMode(null)}
        />
      );
    } else if (authMode === 'signup') {
      return (
        <SignupPage 
          onLoginClick={() => setAuthMode('login')}
          onBackToHome={() => setAuthMode(null)}
        />
      );
    }
  }

  // Role-based dashboard rendering
  const renderDashboard = () => {
    switch (userRole) {
      case USER_ROLES.PATIENT:
        return <PatientDashboard />;
      
      case USER_ROLES.CAREGIVER:
        return <CaregiverDashboard />;
      
      default:
        return <PatientDashboard />; // Fallback to patient dashboard
    }
  };

  // Main application with navigation
  return (
    <div className="app-container">
      {/* 🔧 DEBUG: Add test button */}
      {currentPage !== 'test' && (
        <button
          onClick={() => setCurrentPage('test')}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-yellow-400 text-black rounded-lg shadow-lg hover:bg-yellow-500 font-semibold"
        >
          🧪 Test Page
        </button>
      )}

      {/* Page Content */}
      <div className="page-content">
        {currentPage === 'home' && renderDashboard()}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'test' && <TestDashboard />}
      </div>

      {/* Bottom Navigation - Hide for admin and test page */}
      {currentPage !== 'test' && (
        <BottomNav 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          userRole={userRole}
        />
      )}
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;