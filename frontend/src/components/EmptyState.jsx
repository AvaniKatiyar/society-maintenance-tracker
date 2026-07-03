import React from 'react';
import { ClipboardX } from 'lucide-react';

const EmptyState = ({ title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full text-slate-400">
        <ClipboardX className="w-12 h-12" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
