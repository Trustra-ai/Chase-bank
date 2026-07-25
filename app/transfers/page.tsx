'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PaperAirplaneIcon,
  BuildingLibraryIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

interface TransferRecord {
  id: string;
  recipient: string;
  type: 'Wire Transfer' | 'Zelle' | 'Internal Transfer';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'tr-101',
    recipient: 'Vanguard Investments',
    type: 'Wire Transfer',
    amount: 75000.0,
    date: 'Jul 20, 2026',
    status: 'Completed',
  },
  {
    id: 'tr-102',
    recipient: 'Sarah Jenkins',
    type: 'Zelle',
    amount: 500.0,
    date: 'Jul 18, 2026',
    status: 'Completed',
  },
  {
    id: 'tr-103',
    recipient: 'Chase Reserve Card',
    type: 'Internal Transfer',
    amount: 2500.0,
    date: 'Jul 15, 2026',
    status: 'Completed',
  },
];

export default function TransfersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [transferType, setTransferType] = useState<'internal' | 'zelle' | 'wire'>('internal');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [transfers, setTransfers] = useState<TransferRecord[]>(INITIAL_TRANSFERS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    const authed = localStorage.getItem('chase_auth') === '1';
    if (!authed) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newRecord: TransferRecord = {
        id: `tr-${Date.now()}`,
        recipient: recipient || 'External Recipient',
        type:
          transferType === 'wire'
            ? 'Wire Transfer'
            : transferType === 'zelle'
            ? 'Zelle'
            : 'Internal Transfer',
        amount: parsedAmount,
        date: 'Today',
        status: 'Completed',
      };

      setTransfers([newRecord, ...transfers]);
      setIsSubmitting(false);
      setSuccessMsg(
        `Successfully transferred ${formatCurrency(parsedAmount)} to ${
          recipient || 'recipient'
        }`
      );
      setRecipient('');
      setAmount('');
      setMemo('');

      setTimeout(() => setSuccessMsg(null), 4000);
    }, 600);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans text-slate-900 antialiased">
      {/* Utility bar */}
      <div className="bg-[#0a2540] text-[11px] font-medium text-blue-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6 lg:px-8">
          <span>Chase Online</span>
          <Link href="/" className="hover:text-white">
            ← Back to Accounts
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-900 bg-[#117ACA] shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                <div className="h-4 w-4 rotate-45 border-2 border-[#117ACA]" />
              </div>
              <span className="text-lg font-bold tracking-[0.12em] text-white sm:text-xl">
                CHASE
              </span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm font-medium text-blue-50 sm:flex">
              <Link
                href="/"
                className="rounded px-3 py-1.5 hover:bg-white/10 hover:text-white"
              >
                Accounts
              </Link>
              <span className="rounded bg-white/15 px-3 py-1.5 text-white">
                Pay &amp; transfer
              </span>
              <Link
                href="/cards"
                className="rounded px-3 py-1.5 hover:bg-white/10 hover:text-white"
              >
                Credit cards
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Success toast */}
        {successMsg && (
          <div className="mb-5 flex max-w-full items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-lg sm:mb-6 sm:px-5 sm:py-3.5">
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Pay &amp; transfer
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Move money between accounts, send with Zelle®, or initiate a wire.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 sm:p-7">
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
                {(
                  [
                    { id: 'internal', label: 'Transfer' },
                    { id: 'zelle', label: 'Zelle®' },
                    { id: 'wire', label: 'Wire' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTransferType(tab.id)}
                    className={`-mb-px shrink-0 px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
                      transferType === tab.id
                        ? 'border-b-2 border-[#117ACA] text-[#117ACA]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleTransfer} className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    From
                  </label>
                  <select className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20">
                    <option>
                      Chase Total Checking (•••• 4242) — $6,854,200.00
                    </option>
                    <option>
                      Chase Savings (•••• 9102) — $1,250,000.00
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    {transferType === 'zelle'
                      ? 'To (email or U.S. mobile number)'
                      : transferType === 'wire'
                      ? 'Beneficiary name / account'
                      : 'To'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      transferType === 'zelle'
                        ? 'name@email.com or (555) 555-5555'
                        : transferType === 'wire'
                        ? 'Beneficiary name or account number'
                        : 'Account or recipient name'
                    }
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Amount
                    </label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-md border border-slate-300 py-2.5 pl-7 pr-3.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Memo (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="What's this for?"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      maxLength={40}
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0e6bb5] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4" />
                      {transferType === 'zelle'
                        ? 'Send with Zelle®'
                        : transferType === 'wire'
                        ? 'Continue wire'
                        : 'Transfer'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent transfers
                </h3>
                <ClockIcon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="divide-y divide-slate-100">
                {transfers.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.recipient}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.type} · {item.date}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      −{formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-[#E8F4FC] p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <BuildingLibraryIcon className="h-5 w-5 text-[#117ACA]" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Wire transfer limits
                </h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                As a Chase Private Client, your daily outbound wire limit is{' '}
                <strong>$250,000.00</strong>. Contact your Private Banker for
                larger amounts.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <ArrowsRightLeftIcon className="h-5 w-5 text-[#117ACA]" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Transfer tips
                </h4>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li>• Internal transfers are usually instant</li>
                <li>• Zelle® is typically available in minutes</li>
                <li>• Domestic wires may take 1 business day</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-5 text-xs text-slate-500 sm:mt-12 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 JPMorgan Chase &amp; Co.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            <button type="button" className="hover:underline">
              Privacy
            </button>
            <button type="button" className="hover:underline">
              Security
            </button>
            <button type="button" className="hover:underline">
              Terms of use
            </button>
            <span>Member FDIC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
