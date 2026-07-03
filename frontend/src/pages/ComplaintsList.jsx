import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { TableRowSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RefreshCcw,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';

const ComplaintsList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Filters State
  const [search, setSearch] = useState('');
  const [residentSearch, setResidentSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [overdue, setOverdue] = useState(''); // '', 'true', 'false'
  
  // Data State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admin/complaints' : '/api/complaints';
      
      const params = {
        page,
        size: 10,
        search,
        status: status || null,
        priority: priority || null,
        overdue: overdue === 'true' ? true : overdue === 'false' ? false : null,
      };

      if (isAdmin) {
        params.residentSearch = residentSearch || null;
        params.category = category || null;
      }

      const response = await axios.get(endpoint, { params });
      setComplaints(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      toast.error('Failed to load complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, category, overdue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setResidentSearch('');
    setStatus('');
    setPriority('');
    setCategory('');
    setOverdue('');
    setPage(0);
  };

  const handleExportExcel = () => {
    if (!isAdmin) return;
    
    // Construct query parameter string
    const queryParts = [];
    if (residentSearch) queryParts.push(`residentSearch=${encodeURIComponent(residentSearch)}`);
    if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
    if (priority) queryParts.push(`priority=${encodeURIComponent(priority)}`);
    if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
    if (overdue) queryParts.push(`overdue=${overdue}`);
    if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
    
    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    const downloadUrl = `/api/admin/complaints/export${queryString}`;
    
    // Open in new tab or trigger download directly
    window.open(downloadUrl, '_blank');
    toast.success('Generating Excel spreadsheet...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {isAdmin ? 'Complaint Management' : 'My Service Requests'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin 
              ? 'Oversee, assign priority, export records, and manage tenant resolutions.' 
              : 'Browse and check status timelines on your filed complaints.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-slate-850 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary-500" />
            Filters & Queries
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search globally */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Search Term</label>
              <div className="mt-1.5 relative">
                <input
                  type="text"
                  placeholder="Query text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                />
              </div>
            </div>

            {/* Resident search (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Resident</label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={residentSearch}
                    onChange={(e) => setResidentSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                </div>
              </div>
            )}

            {/* Category selection (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Elevator">Elevator</option>
                  <option value="Security">Security</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Status selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Priority selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Overdue threshold toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overdue Status</label>
              <select
                value={overdue}
                onChange={(e) => setOverdue(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
              >
                <option value="">All Tickets</option>
                <option value="true">Overdue Only</option>
                <option value="false">On Time Only</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset Filters
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-750 rounded-xl shadow-lg transition"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Results table list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-4 space-y-4">
            <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No complaints matching filters"
              description="Adjust your search criteria or reset filters to see other maintenance tickets."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Complaint ID</th>
                    {isAdmin && <th className="px-6 py-4">Resident</th>}
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Date Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">#{c.id}</td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-850 dark:text-slate-200 text-sm">{c.residentName}</p>
                            <p className="text-xs text-slate-400 font-medium">Flat {c.residentFlat}</p>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">{c.category}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-400 text-sm">
                        {c.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Badge type={c.status} />
                          {c.overdue && <Badge type="OVERDUE">Overdue</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge type={c.priority} /></td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-sm">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 border border-slate-250 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 border border-slate-250 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintsList;
