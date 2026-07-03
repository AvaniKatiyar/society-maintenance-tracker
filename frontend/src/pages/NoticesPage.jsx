import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  Loader2, 
  X,
  Pin,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';

const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admin/notices' : '/api/notices';
      const response = await axios.get(endpoint, {
        params: { search: search || null }
      });
      setNotices(response.data || []);
    } catch (err) {
      toast.error('Failed to load notice board announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [search]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    // Convert empty expiry string to null
    if (!data.expiryDate) {
      data.expiryDate = null;
    }
    try {
      await axios.post('/api/admin/notices', data);
      toast.success('Notice published successfully!');
      setModalOpen(false);
      reset();
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish notice');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await axios.delete(`/api/admin/notices/${id}`);
      toast.success('Notice deleted successfully.');
      fetchNotices();
    } catch (err) {
      toast.error('Failed to delete notice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary-500" />
            Society Notice Board
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin 
              ? 'Publish announcements and broadcast emergency notifications to residents.' 
              : 'Keep up to date with society events and maintenance notices.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Notice
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm"
        />
      </div>

      {/* List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      ) : notices.length === 0 ? (
        <EmptyState
          title="No notices found"
          description="Notice board is currently empty. Check back later for updates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((n) => (
            <motion.div
              layout
              key={n.id}
              className={`p-6 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden transition duration-300 ${
                n.important 
                  ? 'border-primary-500 ring-2 ring-primary-500/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Important Pin Indicator */}
              {n.important && (
                <div className="absolute top-4 right-4 text-primary-500 flex items-center gap-1">
                  <Pin className="w-4 h-4 fill-primary-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pinned</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    n.important 
                      ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white pr-14 leading-tight">{n.title}</h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {n.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <div className="flex flex-col gap-1">
                  <span>Published by {n.createdBy}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(n.createdAt).toLocaleDateString()}
                    {n.expiryDate && ` • Expires ${new Date(n.expiryDate).toLocaleDateString()}`}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Notice Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Publish Notice</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Notice Title</label>
                  <input
                    type="text"
                    placeholder="Enter announcement heading..."
                    {...register('title', { required: 'Title is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Notice Details</label>
                  <textarea
                    rows={4}
                    placeholder="Describe announcement specifications..."
                    {...register('description', { required: 'Description is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Optional Expiry Date</label>
                    <input
                      type="datetime-local"
                      {...register('expiryDate')}
                      className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('important')}
                        className="rounded text-primary-650 focus:ring-primary-500 border-slate-300 w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Important (Pins & Emails)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-70"
                  >
                    {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
                    Publish Notice
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

export default NoticesPage;
