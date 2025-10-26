
import React from 'react';

export const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-slate-700"></div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center mt-auto">
          <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded-full w-1/3"></div>
        </div>
      </div>
    </div>
  );
};