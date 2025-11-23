import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import UserApplications from './pages/UserApplications';
import JobApplications from './pages/JobApplications';
import UserProfile from './pages/UserProfile';
import EmployerProfile from './pages/EmployerProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import WorkTracking from './pages/WorkTracking';
import EmployerWorkTracking from './pages/EmployerWorkTracking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              <Route 
                path="/employer/dashboard" 
                element={
                  <ProtectedRoute userType="employer">
                    <EmployerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/post-job" 
                element={
                  <ProtectedRoute userType="employer">
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/edit-job/:id" 
                element={
                  <ProtectedRoute userType="employer">
                    <EditJob />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-applications" 
                element={
                  <ProtectedRoute userType="user">
                    <UserApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/jobs/:jobId/applications" 
                element={
                  <ProtectedRoute userType="employer">
                    <JobApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/profile" 
                element={
                  <ProtectedRoute userType="employer">
                    <EmployerProfile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/work-tracking" 
                element={
                  <ProtectedRoute userType="user">
                    <WorkTracking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/work-tracking" 
                element={
                  <ProtectedRoute userType="employer">
                    <EmployerWorkTracking />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;