import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full w-fit mx-auto mb-6">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-primary-500/20 transition"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
