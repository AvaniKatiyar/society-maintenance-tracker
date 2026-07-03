import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Badge from '../components/Badge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Megaphone, 
  Loader2, 
  Calendar,
  X,
  Upload,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const ResidentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      const [complaintsRes, noticesRes] = await Promise.all([
        axios.get('/api/complaints?size=100'),
        axios.get('/api/notices')
      ]);
      setComplaints(complaintsRes.data.content || []);
      setNotices(noticesRes.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (extension !== '.jpg' && extension !== '.jpeg' && extension !== '.png') {
        toast.error('Only JPG, JPEG, and PNG images are allowed.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await axios.post('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Complaint submitted successfully!');
      setModalOpen(false);
      reset();
      setImagePreview(null);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Aggregated Stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  const open = complaints.filter(c => c.status === 'OPEN').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const pending = open + inProgress;
  const highPriority = complaints.filter(c => c.priority === 'HIGH' && c.status !== 'RESOLVED').length;

  const latestComplaints = complaints.slice(0, 5);
  const pinnedNotice = notices.find(n => n.important);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Resident Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Submit, track, and manage your society maintenance requests.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-primary-500/20 transition"
        >
          <Plus className="w-5 h-5" />
          File Complaint
        </button>
      </div>

      {/* Notice Board Marquee Banner */}
      {pinnedNotice && (
        <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/30 rounded-2xl">
          <div className="p-2 bg-primary-600 text-white rounded-lg">
            <Megaphone className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Pinned Announcement</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{pinnedNotice.title} - {pinnedNotice.description}</p>
          </div>
          <Link to="/notices" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline shrink-0">View All</Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Filed</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{total}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Pending Action</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pending}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Resolved</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolved}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Critical High</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{highPriority}</p>
          </div>
        </div>
      </div>

      {/* Complaints Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Complaints</h2>
          <Link to="/complaints" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition">View All</Link>
        </div>

        {latestComplaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No complaints filed yet"
              description="Everything seems to be running smoothly. If you encounter any maintenance issue, file a complaint."
              actionText="Submit Complaint"
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {latestComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">#{c.id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold">{c.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge type={c.status} />
                        {c.overdue && <Badge type="OVERDUE">Overdue</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge type={c.priority} /></td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition"
                      >
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Create Complaint */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">File New Complaint</h3>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setImagePreview(null);
                    setSelectedFile(null);
                  }}
                  className="p-1 rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="">Select category...</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Security">Security</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Cleaning">Cleaning / Garbage</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue in detail (location, what is wrong, etc.)..."
                    {...register('description', { required: 'Description is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Optional Image Attachment</label>
                  <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-500 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {imagePreview ? (
                      <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 mb-2">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload image</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-75"
                  >
                    {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Submit Complaint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResidentDashboard;
