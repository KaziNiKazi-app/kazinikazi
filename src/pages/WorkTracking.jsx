import { useState, useEffect } from 'react';
import { Play, Square, Clock, CheckCircle, XCircle, Plus, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { workTrackingAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const WorkTracking = () => {
  const [sessions, setSessions] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    jobId: '',
    dailyPayment: '',
    notes: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, summaryRes, applicationsRes] = await Promise.all([
        workTrackingAPI.getMySessions(),
        workTrackingAPI.getSummary(),
        applicationsAPI.getMyApplications({ status: 'accepted' })
      ]);
      
      setSessions(sessionsRes.data);
      setSummary(summaryRes.data);
      setAcceptedJobs(applicationsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await workTrackingAPI.createSession({
        job_id: formData.jobId,
        daily_payment: parseInt(formData.dailyPayment)
      });
      setShowCreateModal(false);
      setFormData({ jobId: '', dailyPayment: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating work session');
    }
  };

  const handleRequestStart = async (sessionId) => {
    try {
      await workTrackingAPI.requestStart(sessionId, { notes: formData.notes });
      setShowStartModal(false);
      setFormData({ ...formData, notes: '' });
      loadData();
    } catch (error) {
      console.error('Error requesting start:', error);
      if (error.response?.status === 400) {
        alert('Cannot start work until employer approves the session. Please wait for approval.');
      } else {
        alert('Error requesting work start');
      }
    }
  };

  const handleRequestEnd = async (sessionId) => {
    try {
      await workTrackingAPI.requestEnd(sessionId, { notes: formData.notes });
      setShowEndModal(false);
      setFormData({ ...formData, notes: '' });
      loadData();
    } catch (error) {
      console.error('Error requesting end:', error);
      alert('Error requesting work end');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const getStatusBadge = (session) => {
    if (!session.start_approved && !session.work_started) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending Start Approval</span>;
    }
    if (session.start_approved && !session.work_started) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Ready to Start</span>;
    }
    if (session.work_started && !session.work_ended) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Work In Progress</span>;
    }
    if (session.work_ended && !session.end_approved) {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Pending End Approval</span>;
    }
    if (session.end_approved) {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Completed & Paid</span>;
    }
  };

  const getSessionActions = (session) => {
    if (!session.start_approved && !session.work_started) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Waiting for employer approval to start work. Do not begin work until approved.
            </span>
          </div>
        </div>
      );
    }

    if (session.start_approved && !session.work_started) {
      return (
        <button
          onClick={() => {
            setSelectedSession(session);
            setShowStartModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Work Now
        </button>
      );
    }

    if (session.work_started && !session.work_ended) {
      return (
        <button
          onClick={() => {
            setSelectedSession(session);
            setShowEndModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
        >
          <Square className="h-4 w-4 mr-2" />
          End Work Session
        </button>
      );
    }

    if (session.work_ended && !session.end_approved) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Waiting for employer approval to complete this session.
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Tracking</h1>
        <p className="text-gray-600">Track your work sessions and earnings</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_sessions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{summary.approved_sessions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending Start</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending_start_approval}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending End</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending_end_approval}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_earnings)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Work Sessions</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Work Session
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work sessions yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first work session</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Work Session
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{session.job_title}</h3>
                  <p className="text-gray-600">Employer: {session.employer_name}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">{getStatusBadge(session)}</div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Daily Payment</p>
                  <p className="font-semibold">{formatCurrency(session.daily_payment)}</p>
                </div>
                {session.hours_worked && (
                  <div>
                    <p className="text-sm text-gray-600">Hours Worked</p>
                    <p className="font-semibold">{session.hours_worked} hrs</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Session Status</p>
                  <p className="font-semibold">
                    {!session.start_approved && 'Pending Start Approval'}
                    {session.start_approved && !session.work_started && 'Ready to Start'}
                    {session.work_started && !session.work_ended && 'Work In Progress'}
                    {session.work_ended && !session.end_approved && 'Pending End Approval'}
                    {session.end_approved && 'Completed & Paid'}
                  </p>
                </div>
              </div>

              {session.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Your Notes</p>
                  <p className="text-sm text-gray-800">{session.notes}</p>
                </div>
              )}

              {session.employer_start_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Employer Start Notes</p>
                  <p className="text-sm text-gray-800">{session.employer_start_notes}</p>
                </div>
              )}

              {session.employer_end_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Employer End Notes</p>
                  <p className="text-sm text-gray-800">{session.employer_end_notes}</p>
                </div>
              )}

              {getSessionActions(session)}
            </div>
          ))}
        </div>
      )}

      {/* Create-session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Work Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Job
                  </label>
                  <select
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a job</option>
                    {acceptedJobs.map((job) => (
                      <option key={job.job_id} value={job.job_id}>
                        {job.job_title} - {job.job_company}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Payment (RWF)
                  </label>
                  <input
                    type="number"
                    value={formData.dailyPayment}
                    onChange={(e) => setFormData({ ...formData, dailyPayment: e.target.value })}
                    required
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter daily payment"
                  />
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    Note: You must wait for employer approval before starting work.
                  </span>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start-session Modal */}
      {showStartModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Start Work Session</h3>
            <p className="text-gray-600 mb-4">You are about to start work for: <strong>{selectedSession.job_title}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes about today's work..."
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestStart(selectedSession.id)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Start Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End-session Modal */}
      {showEndModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">End Work Session</h3>
            <p className="text-gray-600 mb-4">You are about to end work for: <strong>{selectedSession.job_title}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End of Day Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="How did the work go today?..."
                />
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 text-sm">
                  Note: Your employer must approve this session end before it's completed.
                </span>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestEnd(selectedSession.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                End Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTracking;