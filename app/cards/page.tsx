'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCardIcon,
  SparklesIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface CardTransaction {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number;
  pointsEarned: number;
}

const INITIAL_CARD_TRANSACTIONS: CardTransaction[] = [
  {
    id: 'ctx-101',
    merchant: 'Le Bernardin',
    category: 'Dining',
    date: 'Today, 2:15 PM',
    amount: 340.50,
    pointsEarned: 1022,
  },
  {
    id: 'ctx-102',
    merchant: 'Delta Air Lines',
    category: 'Travel',
    date: 'Jul 21, 2026',
    amount: 1250.00,
    pointsEarned: 3750,
  },
  {
    id: 'ctx-103',
    merchant: 'Apple Store',
    category: 'Electronics',
    date: 'Jul 19, 2026',
    amount: 2499.00,
    pointsEarned: 2499,
  },
];

export default function CardsPage() {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [cardBalance, setCardBalance] = useState<number>(12450.00);
  const [availableCredit, setAvailableCredit] = useState<number>(87550.00);
  const [rewardPoints, setRewardPoints] = useState<number>(482900);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handlePayBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paymentAmount);
    if (isNaN(val) || val <= 0) return;
    if (val > cardBalance) {
      alert('Payment amount cannot exceed current balance.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setCardBalance((prev) => prev - val);
      setAvailableCredit((prev) => prev + val);
      setIsSubmitting(false);
      setPaymentAmount('');
      showToast(`Payment of ${formatCurrency(val)} received! Credit line updated.`);
    }, 600);
  };

  const toggleCardLock = () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    showToast(nextState ? 'Card has been locked.' : 'Card unlocked and ready for use.');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl">
          <CheckCircleIcon className="h-6 w-6 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#003087] py-6 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-black tracking-wider text-white">
                CHASE
              </Link>
              <span className="text-blue-300">|</span>
              <h1 className="text-lg font-bold">Credit Cards</h1>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-blue-200 hover:text-white sm:text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Card Hero & Controls */}
          <div className="space-y-6 lg:col-span-2">
            {/* Visual Credit Card Preview */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 p-6 text-white shadow-xl sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Chase Sapphire Reserve®
                </span>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                  Visa Infinite
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Cardholder</p>
                  <p className="text-lg font-bold tracking-wide">FRANK R.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Card Number</p>
                  <p className="font-mono text-sm tracking-wider">•••• •••• •••• 8810</p>
                </div>
              </div>

              {/* Security Lock Badge */}
              {isLocked && (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 py-2.5 text-xs font-bold text-rose-300 backdrop-blur-md">
                  <LockClosedIcon className="h-4 w-4" /> Card Temporarily Locked
                </div>
              )}
            </div>

            {/* Balances & Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Balance
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {formatCurrency(cardBalance)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Credit
                </p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(availableCredit)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <SparklesIcon className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Ultimate Rewards®</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {rewardPoints.toLocaleString()} pts
                </p>
              </div>
            </div>

            {/* Card Payment Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">Pay Card Balance</h2>
              <p className="mt-1 text-xs text-slate-500">
                Transfer funds directly from your Premier Checking Account (•••• 4242).
              </p>

              <form onSubmit={handlePayBalance} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Amount (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="$0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#003087] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(cardBalance.toString())}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Pay Full Balance
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cardBalance === 0}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003087] py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    <>
                      <BanknotesIcon className="h-5 w-5" /> Submit Card Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Controls & Transaction Sidebar */}
          <div className="space-y-6">
            {/* Quick Security Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Card Controls</h3>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={toggleCardLock}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-sm font-semibold transition-all ${
                    isLocked
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isLocked ? (
                      <LockClosedIcon className="h-5 w-5 text-rose-600" />
                    ) : (
                      <LockOpenIcon className="h-5 w-5 text-slate-600" />
                    )}
                    <span>{isLocked ? 'Unlock Card' : 'Lock Card'}</span>
                  </div>
                  <span className="text-xs text-slate-400">{isLocked ? 'Locked' : 'Active'}</span>
                </button>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-xs font-semibold text-slate-700">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>$0 Liability Protection active for unauthorized charges.</span>
                </div>
              </div>
            </div>

            {/* Card Transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Card Activity</h3>

              <div className="mt-4 divide-y divide-slate-100">
                {INITIAL_CARD_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tx.merchant}</p>
                        <p className="text-xs text-slate-500">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs font-semibold text-amber-600">
                          +{tx.pointsEarned} pts
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
