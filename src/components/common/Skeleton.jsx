import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div className="space-y-1.5">
          <div className="w-28 h-4 rounded bg-slate-200" />
          <div className="w-20 h-3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="w-16 h-6 rounded-full bg-slate-100" />
    </div>

    <div className="space-y-2 pt-2">
      <div className="w-full h-4 rounded bg-slate-200" />
      <div className="w-3/4 h-4 rounded bg-slate-200" />
    </div>

    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="w-24 h-5 rounded bg-slate-200" />
      <div className="w-20 h-8 rounded-xl bg-slate-200" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4"><div className="w-24 h-4 rounded bg-slate-200" /></td>
    <td className="py-4 px-4"><div className="w-32 h-4 rounded bg-slate-200" /></td>
    <td className="py-4 px-4"><div className="w-20 h-4 rounded bg-slate-200" /></td>
    <td className="py-4 px-4"><div className="w-16 h-6 rounded-full bg-slate-200" /></td>
  </tr>
);
