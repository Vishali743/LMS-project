import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Static Info Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Auth Pages
import LoginStudent from './pages/LoginStudent';
import LoginTeacher from './pages/LoginTeacher';
import LoginAdmin from './pages/LoginAdmin';
import RegisterStudent from './pages/RegisterStudent';
import RegisterTeacher from './pages/RegisterTeacher';
import ForgotPassword from './pages/ForgotPassword';

// Account Management
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';

// Dynamic Dashboards
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardAdmin from './pages/DashboardAdmin';

// Course Catalog / Specializations
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CourseCreate from './pages/CourseCreate';
import CourseManage from './pages/CourseManage';
import CoursePlayer from './pages/CoursePlayer';
import Gradebook from './pages/Gradebook';

// Assignments & Certificates
import AssignmentsPage from './pages/AssignmentsPage';
import Certificates from './pages/Certificates';
import Footer from './components/Footer';

// Features Details Pages
import FeatureSyllabus from './pages/FeatureSyllabus';
import MyCourses from './pages/MyCourses';
import CertificatesPage from './pages/CertificatesPage';
import InstructorCourses from './pages/InstructorCourses';
import InstructorScholars from './pages/InstructorScholars';
import FeatureAssessments from './pages/FeatureAssessments';
import FeatureCertificates from './pages/FeatureCertificates';
import CheckoutPage from './pages/CheckoutPage';
import CourseQuiz from './pages/CourseQuiz';
import AssignmentDetails from './pages/AssignmentDetails';
import StudentAnalytics from './pages/StudentAnalytics';
import InstructorAssignments from './pages/InstructorAssignments';
import InstructorAnalytics from './pages/InstructorAnalytics';

// Dispatcher that routes /dashboard to the appropriate role-based screen
function DashboardDispatcher() {
  const { dbUser, loading } = useAuth();

  if (loading) return null;
  if (!dbUser) return <Navigate to="/login/student" replace />;

  if (dbUser.role === 'admin') {
    return <DashboardAdmin />;
  } else if (dbUser.role === 'instructor') {
    return <DashboardTeacher />;
  }
  return <DashboardStudent />;
}

// Global top-line navigation loader
function PageTransitionLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'var(--accent-gradient)',
      zIndex: 9999,
      boxShadow: '0 0 8px var(--accent-glow)',
      animation: 'loading-bar 0.25s linear'
    }} />
  );
}

// Universal Back Navigation Button
function GlobalBackNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide back button on the landing pages, logins, register screens and main syllabus features
  const excludedPaths = [
    '/',
    '/login/student',
    '/login/teacher',
    '/login/admin',
    '/register/student',
    '/register/teacher',
    '/forgot-password',
    '/features/assessments',
    '/features/certificates'
  ];

  if (excludedPaths.includes(location.pathname) || location.pathname.startsWith('/features/syllabus')) {
    return null;
  }

  return (
    <div className="container-wide" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-small"
        style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}
      >
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );
}

// Robust Error Boundary to prevent blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LMS App Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#06070a',
          color: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff3344', marginBottom: '12px' }}>
            SkeinLMS Application Notice
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '16px', maxWidth: '500px', fontSize: '14px' }}>
            The application caught an unexpected component initialization event:
          </p>
          <div style={{
            color: '#ff6b7b',
            fontFamily: 'monospace',
            fontSize: '13px',
            backgroundColor: 'rgba(255, 51, 68, 0.08)',
            border: '1px solid rgba(255, 51, 68, 0.2)',
            padding: '14px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            maxWidth: '640px',
            wordBreak: 'break-word',
            textAlign: 'left'
          }}>
            {this.state.error ? this.state.error.toString() : 'Unknown Component Error'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff3344 0%, #991b1b 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <PageTransitionLoader />
          
          <div className="main-content" style={{ flex: 1 }}>
            <GlobalBackNavigation />
            <Routes>
              {/* Static Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Feature Explainers */}
              <Route path="/features/syllabus" element={<FeatureSyllabus />} />
              <Route path="/features/syllabus/:subpage" element={<FeatureSyllabus />} />
              <Route path="/features/assessments" element={<FeatureAssessments />} />
              <Route path="/features/certificates" element={<FeatureCertificates />} />

              {/* Course Catalog public routes */}
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:id" element={<CourseDetail />} />

              {/* Login & Registrations (Split) */}
              <Route path="/login/student" element={<LoginStudent />} />
              <Route path="/login/teacher" element={<LoginTeacher />} />
              <Route path="/login/admin" element={<LoginAdmin />} />
              <Route path="/register/student" element={<RegisterStudent />} />
              <Route path="/register/teacher" element={<RegisterTeacher />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Dispatcher Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardDispatcher />
                  </ProtectedRoute>
                } 
              />

              {/* Specific Protected Dashboards */}
              <Route 
                path="/dashboard/student" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardStudent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/my-courses" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/certificates" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CertificatesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:id/quizzes/:quizId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CourseQuiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:id/assignments" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AssignmentDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/teacher" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <DashboardTeacher />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/assignments" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorAssignments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                } 
              />

              {/* Account Settings & Profile */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />

              {/* Course study elements */}
              <Route 
                path="/courses/:id/play" 
                element={
                  <ProtectedRoute>
                    <CoursePlayer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:id/assignments" 
                element={
                  <ProtectedRoute>
                    <AssignmentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificates/:courseId" 
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout/:courseId" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />

              {/* Instructor curriculum tools */}
              <Route 
                path="/instructor/my-courses" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/students" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorScholars />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/new" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <CourseCreate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:id/manage" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <CourseManage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:id/grades" 
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <Gradebook />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  </ErrorBoundary>
  );
}

export default App;
