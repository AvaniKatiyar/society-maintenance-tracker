import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { 
  User, 
  KeyRound, 
  Phone, 
  Save, 
  Loader2, 
  Upload,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, updateProfileState } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      flatNumber: user?.flatNumber || ''
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const handleUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const response = await axios.put('/api/profile', data);
      updateProfileState(response.data);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (data) => {
    setPasswordLoading(true);
    try {
      await axios.put('/api/profile/change-password', data);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (extension !== '.jpg' && extension !== '.jpeg' && extension !== '.png') {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateProfileState(response.data);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error('Failed to upload image.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your credentials, details, and avatar image details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Avatar upload details */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col items-center text-center h-fit">
          <div className="relative">
            <img
              src={user?.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
              alt="Profile avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary-500/20"
            />
            {uploadLoading && (
              <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <h3 className="mt-4 font-bold text-lg text-slate-900 dark:text-white">{user?.fullName}</h3>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">{user?.role} ACCOUNT</p>
          {user?.flatNumber && <p className="text-sm text-slate-500 font-medium mt-1">Flat {user.flatNumber}</p>}

          <div className="mt-6 w-full">
            <label className="relative flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold text-sm cursor-pointer transition">
              <Upload className="w-4 h-4" />
              Change Avatar
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Middle and Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile details Update */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Personal Details
            </h3>

            <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile('fullName', { required: 'Full name is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {profileErrors.fullName && <p className="mt-1 text-xs text-rose-500">{profileErrors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      {...registerProfile('phoneNumber')}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                    />
                  </div>
                </div>
              </div>

              {user?.role === 'RESIDENT' && (
                <div className="max-w-xs">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Flat Number</label>
                  <input
                    type="text"
                    {...registerProfile('flatNumber', { required: 'Flat number is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {profileErrors.flatNumber && <p className="mt-1 text-xs text-rose-500">{profileErrors.flatNumber.message}</p>}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-75"
                >
                  {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Details
                </button>
              </div>
            </form>
          </div>

          {/* Password update */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-500" />
              Security Password
            </h3>

            <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('oldPassword', { required: 'Current password is required' })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {passwordErrors.oldPassword && <p className="mt-1 text-xs text-rose-500">{passwordErrors.oldPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters..."
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  {passwordErrors.newPassword && <p className="mt-1 text-xs text-rose-500">{passwordErrors.newPassword.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-75"
                >
                  {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
