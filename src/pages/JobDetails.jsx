import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building, Calendar } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(id);
      setJob(response.data);
    } catch (error) {
      setError('Job not found');
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated || user.userType !== 'user') {
      navigate = useNavigate()
      navigate('/login')
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.createApplication({ job_id: job.id });
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      if (error.response?.status === 400) {
        alert('You have already applied to this job');
        setHasApplied(true);
      } else {
        alert('Error applying to job');
      }
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(salary);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
        <Link to="/jobs" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              <span>{job.employer_name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{job.district}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              <span>{formatSalary(job.salary)}</span>
            </div>
            {job.application_deadline && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>Apply by {formatDate(job.application_deadline)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Job Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Category</h3>
                    <p className="text-gray-600">{job.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Location</h3>
                    <p className="text-gray-600">{job.district}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Salary</h3>
                    <p className="text-gray-600">{formatSalary(job.salary)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Status</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">About the Employer</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Company:</strong> {job.employer_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Location:</strong> {job.district}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">How to Apply</h3>
                <p className="text-gray-700 mb-4">
                  Contact the employer directly or click below to apply.
                </p>
                {isAuthenticated && user.userType === 'user' && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Apply for this Job</h3>
                    {hasApplied ? (
                      <div className="text-green-600 font-medium">
                        ✓ You have applied to this job
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      >
                        {applying ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                )}

                {isAuthenticated && user.userType === 'employer' && job.employer_id === user.id && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Manage This Job</h3>
                    <Link
                      to={`/employer/edit-job/${job.id}`}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium text-center block"
                    >
                      Edit Job Posting
                    </Link>
                  </div>
                )}
              </div>

              {job.application_deadline && (
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-800">
                      Apply before {formatDate(job.application_deadline)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link 
          to="/jobs" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          Back to all jobs
        </Link>
      </div>
    </div>
  );
};

export default JobDetails;