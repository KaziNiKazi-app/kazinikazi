import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, User, Calendar, AlertCircle } from 'lucide-react';
import { workTrackingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmployerWorkTracking = () => {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showApproveStartModal, setShowApproveStartModal] = useState(false);
  const [showApproveEndModal, setShowApproveEndModal] = useState(false);
  const [approveData, setApproveData] = useState({
    approved: true,
    employer_notes: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, summaryRes] = await Promise.all([
        workTrackingAPI.getEmployerSessions(),
        workTrackingAPI.getEmployerSummary()
      ]);
      
      setSessions(sessionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStart = async () => {
    try {
      await workTrackingAPI.approveStart(selectedSession.id, approveData);
      setShowApproveStartModal(false);
      setApproveData({ approved: true, employer_notes: '' });
      loadData();
    } catch (error) {
      console.error('Error approving start:', error);
      alert('Error approving work session start');
    }
  };

  const handleApproveEnd = async () => {
    try {
      await workTrackingAPI.approveEnd(selectedSession.id, approveData);
      setShowApproveEndModal(false);
      setApproveData({ approved: true, employer_notes: '' });
      loadData();
    } catch (error) {
      console.error('Error approving end:', error);
      alert('Error approving work session end');
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
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedSession(session);
              setApproveData({ approved: true, employer_notes: '' });
              setShowApproveStartModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Start
          </button>
          <button
            onClick={() => {
              setSelectedSession(session);
              setApproveData({ approved: false, employer_notes: '' });
              setShowApproveStartModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Start
          </button>
        </div>
      );
    }

    if (session.work_ended && !session.end_approved) {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedSession(session);
              setApproveData({ approved: true, employer_notes: '' });
              setShowApproveEndModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve End
          </button>
          <button
            onClick={() => {
              setSelectedSession(session);
              setApproveData({ approved: false, employer_notes: '' });
              setShowApproveEndModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject End
          </button>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Session Management</h1>
        <p className="text-gray-600">Approve and manage employee work sessions</p>
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
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_earnings)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work sessions yet</h3>
          <p className="text-gray-500">Employees will appear here when they create work sessions</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{session.job_title}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>{session.user_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-2">{getStatusBadge(session)}</div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                {session.start_time && (
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-semibold text-sm">{formatDate(session.start_time)}</p>
                  </div>
                )}
                {session.end_time && (
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-semibold text-sm">{formatDate(session.end_time)}</p>
                  </div>
                )}
              </div>

              {session.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Employee Notes</p>
                  <p className="text-sm text-gray-800">{session.notes}</p>
                </div>
              )}

              {session.employer_start_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Your Start Notes</p>
                  <p className="text-sm text-gray-800">{session.employer_start_notes}</p>
                </div>
              )}

              {session.employer_end_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Your End Notes</p>
                  <p className="text-sm text-gray-800">{session.employer_end_notes}</p>
                </div>
              )}

              {getSessionActions(session)}
            </div>
          ))}
        </div>
      )}

      {/* Approve/Reject Start Modal */}
      {showApproveStartModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {approveData.approved ? 'Approve' : 'Reject'} Work Session Start
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to {approveData.approved ? 'approve' : 'reject'} work session start for: 
              <strong> {selectedSession.user_name}</strong>
            </p>
            {!approveData.approved && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    The employee will not be able to start work until you approve.
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes {!approveData.approved && '(Required for rejection)'}
                </label>
                <textarea
                  value={approveData.employer_notes}
                  onChange={(e) => setApproveData({ ...approveData, employer_notes: e.target.value })}
                  rows="3"
                  required={!approveData.approved}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={approveData.approved ? "Optional notes..." : "Please provide reason for rejection..."}
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowApproveStartModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveStart}
                disabled={!approveData.approved && !approveData.employer_notes}
                className={`flex-1 py-2 px-4 rounded-lg text-white ${
                  approveData.approved 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {approveData.approved ? 'Approve Start' : 'Reject Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject End Modal */}
      {showApproveEndModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {approveData.approved ? 'Approve' : 'Reject'} Work Session End
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to {approveData.approved ? 'approve' : 'reject'} work session end for: 
              <strong> {selectedSession.user_name}</strong>
            </p>
            {!approveData.approved && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    The session will not be completed and paid until you approve.
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes {!approveData.approved && '(Required for rejection)'}
                </label>
                <textarea
                  value={approveData.employer_notes}
                  onChange={(e) => setApproveData({ ...approveData, employer_notes: e.target.value })}
                  rows="3"
                  required={!approveData.approved}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={approveData.approved ? "Optional notes..." : "Please provide reason for rejection..."}
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowApproveEndModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveEnd}
                disabled={!approveData.approved && !approveData.employer_notes}
                className={`flex-1 py-2 px-4 rounded-lg text-white ${
                  approveData.approved 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {approveData.approved ? 'Approve End' : 'Reject End'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerWorkTracking;
