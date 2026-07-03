import React from 'react';

export const CardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
    </div>
    <div className="mt-4">
      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="mt-2 w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
    <div className="flex items-center gap-4 flex-1">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      <div className="space-y-2 flex-1 max-w-[250px]">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      </div>
    </div>
    <div className="flex gap-4">
      <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      </div>
    </div>
  </div>
);
