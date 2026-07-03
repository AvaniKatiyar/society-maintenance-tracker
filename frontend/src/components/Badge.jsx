import React from 'react';

const Badge = ({ type, children }) => {
  const getStyles = () => {
    switch (type?.toUpperCase()) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30';
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30';
      case 'MEDIUM':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30';
      case 'LOW':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-200 dark:border-slate-800/30';
      case 'OVERDUE':
        return 'bg-rose-500 text-white dark:bg-rose-600 dark:text-rose-100 animate-pulse border border-rose-600 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStyles()}`}>
      {children || type}
    </span>
  );
};

export default Badge;
