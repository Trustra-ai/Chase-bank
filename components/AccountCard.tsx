'use client';

import { ReactNode } from 'react';

export interface AccountCardProps {
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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${iconBg}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {number}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {formatCurrency(balance)}
        </h2>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">
          {footer}
        </span>

        {onActivity && (
          <button
            type="button"
            onClick={onActivity}
            className="rounded-md px-2 py-1 text-sm font-semibold text-[#117ACA] transition hover:bg-blue-50 hover:text-[#0f5fa3]"
          >
            View activity
          </button>
        )}
      </div>
    </article>
  );
}
