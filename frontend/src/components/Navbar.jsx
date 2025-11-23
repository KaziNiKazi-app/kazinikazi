import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-800">KaziNiKazi</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600">
              Browse Jobs
            </Link>
            {isAuthenticated && user.userType === 'user' && (
              <>
                <Link to="/my-applications" className="text-gray-600 hover:text-blue-600">
                  My Applications
                </Link>
                <Link to="/work-tracking" className="text-gray-600 hover:text-blue-600">
                  Work Tracking
                </Link>
                <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                {user.userType === 'employer' && (
                  <>
                    <Link to="/employer/dashboard" className="text-gray-600 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/employer/work-tracking" className="text-gray-600 hover:text-blue-600">
                      Work Sessions
                    </Link>
                    <Link to="/employer/profile" className="flex items-center text-gray-600 hover:text-blue-600">
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;