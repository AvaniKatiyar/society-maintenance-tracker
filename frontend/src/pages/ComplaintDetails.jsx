import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  MessageSquare,
  Loader2,
  CheckCircle2,
  History,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const fetchComplaintDetails = async () => {
    try {
      const [detailsRes, historyRes] = await Promise.all([
        axios.get(`/api/complaints/${id}`),
        axios.get(`/api/complaints/${id}/history`)
      ]);
      setComplaint(detailsRes.data);
      setHistory(historyRes.data);

      // Pre-fill admin form
      setValue('status', detailsRes.data.status);
      setValue('priority', detailsRes.data.priority);
    } catch (err) {
      toast.error('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id, setValue]);

  const onSubmitUpdate = async (data) => {
    setUpdateLoading(true);
    try {
      await axios.put(`/api/admin/complaints/${id}/status`, data);
      toast.success('Complaint updated successfully!');
      fetchComplaintDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!complaint) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">Complaint not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-500 font-bold">Go Back</button>
      </div>
    );
  }

  const isResolved = complaint.status === 'RESOLVED';

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service Tickets / ID #{complaint.id}</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{complaint.category} Request</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ticket Details & Image attachment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge type={complaint.status} />
              <Badge type={complaint.priority} />
              {complaint.overdue && <Badge type="OVERDUE">Overdue</Badge>}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-500" />
                Problem Description
              </h3>
              <p className="mt-2 text-slate-700 dark:text-slate-350 leading-relaxed text-sm whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {complaint.description}
              </p>
            </div>

            {/* Photo Preview Trigger */}
            {complaint.imageUrl && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ImageIcon className="w-4 h-4 text-primary-500" />
                  Attachment Preview
                </h3>
                <div 
                  onClick={() => setImageModalOpen(true)}
                  className="relative max-w-sm h-48 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-sm"
                >
                  <img src={complaint.imageUrl} alt="Attached issue" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition text-xs">
                    Click to Enlarge
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider">Submitted By</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{complaint.residentName} (Flat {complaint.residentFlat})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider">Date Created</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Tracking History */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-primary-500" />
              Workflow Status History
            </h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((h, hIdx) => (
                  <li key={h.id}>
                    <div className="relative pb-8">
                      {hIdx !== history.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-primary-500" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{h.actorName}</span>
                              <span className="text-xs text-slate-400 font-medium">{new Date(h.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">
                              Transitioned status to <Badge type={h.newStatus} />
                              {h.oldStatus && <> (from <Badge type={h.oldStatus} />)</>}
                            </p>
                          </div>
                          {h.note && (
                            <div className="mt-2 text-sm text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                              {h.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Admin Update Box */}
        {isAdmin && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              Admin Actions
            </h3>

            {isResolved ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-sm font-semibold">
                This complaint is marked as RESOLVED. No further updates are permitted.
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assign Status</label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assign Priority</label>
                  <select
                    {...register('priority', { required: 'Priority is required' })}
                    className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Update Note / Resolution Comments</label>
                  <textarea
                    rows={4}
                    placeholder="Enter details on what action was taken, update log explanation, etc..."
                    {...register('note', { required: 'Update note is required' })}
                    className="mt-1.5 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {errors.note && <p className="mt-1 text-xs text-rose-500">{errors.note.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-75"
                >
                  {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Update Complaint State
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Image Modal Lightbox */}
      <AnimatePresence>
        {imageModalOpen && (
          <div 
            onClick={() => setImageModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            >
              <img src={complaint.imageUrl} alt="Enlarged issue details" className="w-full h-full object-contain max-h-[90vh]" />
              <button
                onClick={() => setImageModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintDetails;
