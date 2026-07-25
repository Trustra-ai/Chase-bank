'use client';

import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Statement {
  id: string;
  monthYear: string;
  fileSize: string;
}

interface StatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadStart?: (filename: string) => void;
}

const STATEMENTS_DATA: Statement[] = [
  { id: 'stmt-2026-06', monthYear: 'June 2026 Statement', fileSize: '1.4 MB' },
  { id: 'stmt-2026-05', monthYear: 'May 2026 Statement', fileSize: '1.2 MB' },
  { id: 'stmt-2026-04', monthYear: 'April 2026 Statement', fileSize: '1.5 MB' },
  { id: 'stmt-2026-03', monthYear: 'March 2026 Statement', fileSize: '1.1 MB' },
];

export default function StatementsModal({
  isOpen,
  onClose,
  onDownloadStart,
}: StatementsModalProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (stmt: Statement) => {
    setDownloadingId(stmt.id);

    // Simulate backend PDF download stream
    setTimeout(() => {
      setDownloadingId(null);
      if (onDownloadStart) {
        onDownloadStart(stmt.monthYear);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Account Statements</h3>
            <p className="text-xs text-slate-500">
              Premier Checking Account • •••• 4242
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-500">
            Download official monthly account statements (PDF):
          </p>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {STATEMENTS_DATA.map((stmt) => {
              const isDownloading = downloadingId === stmt.id;
              return (
                <div
                  key={stmt.id}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{stmt.monthYear}</p>
                    <p className="text-xs text-slate-400">PDF • {stmt.fileSize}</p>
                  </div>

                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownload(stmt)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#003087] transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[#003087] disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
