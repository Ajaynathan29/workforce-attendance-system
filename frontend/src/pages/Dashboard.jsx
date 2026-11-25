import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Play, Square, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch all attendance logs for the logged-in user
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await API.get('/attendance');
      setRecords(res.data);
    } catch (err) {
      setError('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle Check In
  const handleCheckIn = async () => {
    setError('');
    setStatusMsg('');
    try {
      await API.post('/attendance/check-in');
      setStatusMsg('✅ Successfully checked in for today!');
      fetchRecords(); // Refresh logs
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking in.');
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    setError('');
    setStatusMsg('');
    try {
      await API.post('/attendance/check-out');
      setStatusMsg('🏁 Successfully checked out. Have a great evening!');
      fetchRecords(); // Refresh logs
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking out.');
    }
  };

  // Format timestamp into clean readable time
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome & Action Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Log your daily work hours and track your attendance logs in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <button
            onClick={handleCheckIn}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all duration-150 active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Check In</span>
          </button>

          <button
            onClick={handleCheckOut}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all duration-150 active:scale-95"
          >
            <Square className="h-5 w-5 fill-current" />
            <span>Check Out</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {statusMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      {/* History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Recent Attendance History</h2>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            Cloud MySQL Live
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading your cloud attendance logs...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No attendance records found yet. Click <strong>Check In</strong> above to log your first day!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Check In</th>
                  <th className="py-3 px-6 font-semibold">Check Out</th>
                  <th className="py-3 px-6 font-semibold">Total Hours</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {records.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 font-medium flex items-center space-x-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(log.check_in)}</span>
                    </td>
                    <td className="py-4 px-6 text-amber-600 font-medium">
                      {formatTime(log.check_out)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {log.total_hours ? `${log.total_hours} hrs` : 'In Progress...'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'Half Day' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;