'use client';

import React, { ReactNode } from 'react';

interface AccountCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  number: string;
  label: string;
  balance: number;
  footer: string;
  formatCurrency: (amount: number) => string;
  onActivity?: () => void;
}

export default function AccountCard({
  icon,
  iconBg,
  title,
  number,
  label,
  balance,
  footer,
  formatCurrency,
  onActivity,
}: AccountCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${iconBg}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>
              <p className="text-xs font-medium text-slate-500">{number}</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-medium text-slate-500">{footer}</span>
        {onActivity && (
          <button
            type="button"
            onClick={onActivity}
            className="font-semibold text-[#117ACA] transition-colors hover:text-[#0d5f9e] hover:underline"
          >
            Activity
          </button>
        )}
      </div>
    </div>
  );
}

