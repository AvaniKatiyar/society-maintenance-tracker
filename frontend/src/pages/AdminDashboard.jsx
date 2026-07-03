import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Badge from '../components/Badge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Settings as SettingsIcon,
  Save,
  Loader2
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState('');
  const [settingLoading, setSettingLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/settings')
      ]);
      setStats(statsRes.data);
      setThreshold(settingsRes.data.settingValue);
    } catch (err) {
      toast.error('Failed to load admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateSetting = async () => {
    if (!threshold || isNaN(threshold) || parseInt(threshold) <= 0) {
      toast.error('Please enter a valid day threshold (greater than 0)');
      return;
    }
    setSettingLoading(true);
    try {
      await axios.put('/api/admin/settings', {
        settingKey: 'overdue_threshold_days',
        settingValue: threshold
      });
      toast.success('Overdue threshold updated successfully!');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update configurations');
    } finally {
      setSettingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Setup Chart Data Configurations
  const categoryChartData = {
    labels: stats.complaintsByCategory.map(c => c.category),
    datasets: [{
      label: 'Complaints',
      data: stats.complaintsByCategory.map(c => c.count),
      backgroundColor: [
        'rgba(99, 102, 241, 0.7)',
        'rgba(6, 182, 212, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(168, 85, 247, 0.7)',
        'rgba(100, 116, 139, 0.7)',
      ],
      borderWidth: 1,
    }]
  };

  const statusChartData = {
    labels: stats.complaintsByStatus.map(s => s.status),
    datasets: [{
      label: 'Complaints',
      data: stats.complaintsByStatus.map(s => s.count),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 8,
    }]
  };

  const priorityChartData = {
    labels: stats.complaintsByPriority.map(p => p.priority),
    datasets: [{
      label: 'Priority levels',
      data: stats.complaintsByPriority.map(p => p.count),
      backgroundColor: [
        'rgba(100, 116, 139, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(239, 68, 68, 0.7)'
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'currentColor',
          boxWidth: 12,
          padding: 15,
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Society oversight overview: maintenance requests and priority distributions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Filed</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalComplaints}</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Open</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.openComplaints}</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.inProgressComplaints}</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Resolved</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.resolvedComplaints}</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Overdue Alerts</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.overdueComplaints}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Complaints by Category</h3>
          <div className="h-60 relative flex items-center justify-center">
            {stats.complaintsByCategory.length === 0 ? <span className="text-sm text-slate-400">No data</span> : <Doughnut data={categoryChartData} options={chartOptions} />}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Complaints by Status</h3>
          <div className="h-60 relative flex items-center justify-center">
            {stats.complaintsByStatus.length === 0 ? <span className="text-sm text-slate-400">No data</span> : <Bar data={statusChartData} options={chartOptions} />}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Priority Distribution</h3>
          <div className="h-60 relative flex items-center justify-center">
            {stats.complaintsByPriority.length === 0 ? <span className="text-sm text-slate-400">No data</span> : <PolarArea data={priorityChartData} options={chartOptions} />}
          </div>
        </div>
      </div>

      {/* Bottom Panel Settings & Latest Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Complaints */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Latest Activity</h2>
              <Link to="/admin/complaints" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition">Manage All</Link>
            </div>
            
            {stats.latestComplaints.length === 0 ? (
              <div className="p-6"><EmptyState title="No complaints submitted" description="No maintenance tickets have been submitted to date." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {stats.latestComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">#{c.id} - {c.category}</p>
                            <p className="text-xs text-slate-400 mt-0.5">By {c.residentName} ({c.residentFlat})</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Badge type={c.status} />
                            {c.overdue && <Badge type="OVERDUE">Overdue</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/complaints/${c.id}`} className="text-primary-500 hover:underline text-sm font-bold flex items-center gap-1">
                            Review <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Configurations Threshold */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-850 dark:text-white">
              <SettingsIcon className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-lg">System Settings</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Configure parameters for automatic overdue calculations.</p>
            
            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Overdue Threshold (Days)</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 5"
                className="mt-2 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <p className="mt-1 text-xs text-slate-400">If a ticket is unresolved after this period, it triggers an overdue alert.</p>
            </div>
          </div>

          <button
            onClick={handleUpdateSetting}
            disabled={settingLoading}
            className="w-full mt-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-75"
          >
            {settingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
