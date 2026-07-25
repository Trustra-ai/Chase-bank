'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountCard from '@/components/AccountCard';
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

type ActiveModal = 'transfer' | 'pay' | 'deposit' | 'statements' | 'alerts' | 'support' | null;

interface AccountData {
  customerName: string;
  customerInitials: string;
  tier: string;
  accountType: string;
  accountNumberMasked: string;
  availableBalance: number;
  checkingBalance: number;
  savingsBalance: number;
  cardBalance: number;
  lastSignIn: string;
}

interface TransactionItem {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface StatementItem {
  id: string;
  monthYear: string;
  period: string;
  fileName: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const getUSFormattedTime = () => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(new Date());
};

const INITIAL_ACCOUNT: AccountData = {
  customerName: 'Frank R.',
  customerInitials: 'FR',
  tier: 'Private Client',
  accountType: 'Chase Total Checking',
  accountNumberMasked: '•••• 4242',
  availableBalance: 6854200,
  checkingBalance: 6854200,
  savingsBalance: 248500,
  cardBalance: 12450,
  lastSignIn: 'Today, 5:59 PM EDT',
};

const INITIAL_TXNS: TransactionItem[] = [
  { id: '1', title: 'ATM Withdrawal (incl. 10% fee)', category: 'Cash & ATM', date: 'Today, 10:14 AM EDT', amount: 9900, type: 'debit' },
  { id: '2', title: 'Salary Deposit', category: 'Payroll', date: 'Jul 24, 2026', amount: 120000, type: 'credit' },
  { id: '3', title: 'Wire Transfer', category: 'Incoming Wire', date: 'Jul 20, 2026', amount: 75000, type: 'credit' },
  { id: '4', title: 'Card Purchase', category: 'Merchant', date: 'Jul 19, 2026', amount: 240, type: 'debit' },
];

const STATEMENTS: StatementItem[] = [
  { id: 's1', monthYear: 'June 2026 Statement', period: '06/01/2026 – 06/30/2026', fileName: 'Chase_June_2026.txt' },
  { id: 's2', monthYear: 'May 2026 Statement', period: '05/01/2026 – 05/31/2026', fileName: 'Chase_May_2026.txt' },
  { id: 's3', monthYear: 'April 2026 Statement', period: '04/01/2026 – 04/30/2026', fileName: 'Chase_April_2026.txt' },
];

export default function ChaseDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [transactions, setTransactions] = useState(INITIAL_TXNS);
  const [activeModal, setActiveModal] = useState<ActiveModal>('deposit');
  const [notification, setNotification] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billPayee, setBillPayee] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const authed = localStorage.getItem('chase_auth') === '1';
    if (!authed) {
      router.replace('/login');
    } else {
      setAccount((prev) => ({
        ...prev,
        lastSignIn: `Today, ${getUSFormattedTime()}`,
      }));
      setReady(true);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('chase_auth');
    localStorage.removeItem('chase_remember');
    router.replace('/login');
  };

  const notify = (msg: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(msg);
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(transferAmount);
    if (isNaN(val) || val <= 0) return;

    const fee = val * 0.10;
    const totalDeduction = val + fee;

    if (totalDeduction > account.availableBalance) {
      notify(`Insufficient funds. Total cost with 10% fee: ${formatCurrency(totalDeduction)}`);
      return;
    }

    setAccount((p) => ({
      ...p,
      availableBalance: p.availableBalance - totalDeduction,
      checkingBalance: p.checkingBalance - totalDeduction,
    }));

    setTransactions((p) => [
      {
        id: `tx-${Date.now()}`,
        title: `Transfer to ${transferRecipient || 'Recipient'} (incl. 10% fee)`,
        category: 'Transfer',
        date: 'Just now',
        amount: totalDeduction,
        type: 'debit',
      },
      ...p,
    ]);

    notify(`Transferred ${formatCurrency(val)} (+ ${formatCurrency(fee)} fee)`);
    setTransferAmount('');
    setTransferRecipient('');
    setActiveModal(null);
  };

  const handleBillPay = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(billAmount);
    if (isNaN(val) || val <= 0 || val > account.availableBalance) return;
    setAccount((p) => ({
      ...p,
      availableBalance: p.availableBalance - val,
      checkingBalance: p.checkingBalance - val,
    }));
    setTransactions((p) => [
      { id: `tx-${Date.now()}`, title: `Bill Payment: ${billPayee || 'Biller'}`, category: 'Bill Pay', date: 'Just now', amount: val, type: 'debit' },
      ...p,
    ]);
    notify(`Paid ${formatCurrency(val)}`);
    setBillAmount('');
    setBillPayee('');
    setActiveModal(null);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    setAccount((p) => ({
      ...p,
      availableBalance: p.availableBalance + val,
      checkingBalance: p.checkingBalance + val,
    }));
    setTransactions((p) => [
      { id: `tx-${Date.now()}`, title: 'Mobile Check Deposit', category: 'Deposit', date: 'Just now', amount: val, type: 'credit' },
      ...p,
    ]);
    notify(`Deposited ${formatCurrency(val)}`);
    setDepositAmount('');
    setActiveModal(null);
  };

  const downloadStatement = (stmt: StatementItem) => {
    setDownloadingId(stmt.id);

    setTimeout(() => {
      const content = `Statement: ${stmt.monthYear}
Customer: ${account.customerName}
Balance: ${formatCurrency(account.availableBalance)}
`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = stmt.fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadingId(null);
      notify(`Downloaded ${stmt.monthYear}`);
    }, 700);
  };

  const parsedTransferAmount = parseFloat(transferAmount) || 0;
  const calculatedFee = parsedTransferAmount * 0.10;
  const maxAllowedTransfer = account.availableBalance / 1.10;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="flex items-center gap-2 text-slate-500">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-[#117ACA]" />
          <p className="text-sm font-medium">Loading session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f5f7fa] font-sans text-slate-900 antialiased">
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex max-w-[90vw] items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-xl sm:px-5 sm:py-3.5">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Utility bar */}
      <div className="bg-[#0a2540] text-[11px] font-medium text-blue-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6 lg:px-8">
          <span>Chase Online</span>
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => setActiveModal('support')}
              className="flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
            >
              <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Customer service</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('alerts')}
              className="flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
            >
              <BellIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-900/40 bg-[#117ACA] shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm">
                <div className="h-4 w-4 rotate-45 border-[2.5px] border-[#117ACA]" />
              </div>
              <span className="text-lg font-bold tracking-[0.14em] text-white sm:text-xl">CHASE</span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm font-medium text-blue-50 lg:flex">
              <Link href="/" className="rounded-lg bg-white/15 px-3.5 py-1.5 font-semibold text-white">Accounts</Link>
              <Link href="/transfers" className="rounded-lg px-3.5 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Pay &amp; transfer</Link>
              <Link href="/cards" className="rounded-lg px-3.5 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Credit cards</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-white sm:block">
              <p className="text-sm font-semibold leading-tight">{account.customerName}</p>
              <p className="text-[11px] text-blue-100">{account.tier}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#117ACA] shadow-sm">
              {account.customerInitials}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded-lg p-1.5 text-blue-50 transition-colors hover:bg-white/10 sm:inline-flex"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-blue-50 transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-blue-600/50 bg-[#0e6bb5] px-3 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium text-white">
              <Link href="/" className="rounded-md bg-white/15 px-3 py-2" onClick={() => setMobileMenuOpen(false)}>Accounts</Link>
              <Link href="/transfers" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Pay &amp; transfer</Link>
              <Link href="/cards" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Credit cards</Link>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                className="rounded-md px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome Banner */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good afternoon, {account.customerName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Last sign-in: {account.lastSignIn}</p>
        </div>

        {/* Modular Account Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AccountCard
            icon={<BanknotesIcon className="h-5 w-5" />}
            iconBg="bg-[#117ACA]"
            title={account.accountType}
            number={account.accountNumberMasked}
            label="Available balance"
            balance={account.checkingBalance}
            footer="Present balance same"
            formatCurrency={formatCurrency}
            onActivity={() => setActiveModal('statements')}
          />
          <AccountCard
            icon={<ChartBarIcon className="h-5 w-5" />}
            iconBg="bg-emerald-600"
            title="Chase Savings"
            number="•••• 9034"
            label="Available balance"
            balance={account.savingsBalance}
            footer="APY 0.01%"
            formatCurrency={formatCurrency}
          />
          <AccountCard
            icon={<CreditCardIcon className="h-5 w-5" />}
            iconBg="bg-violet-700"
            title="Chase Sapphire Preferred"
            number="•••• 7712"
            label="Current balance"
            balance={account.cardBalance}
            footer={`Available credit ${formatCurrency(15000 - account.cardBalance)}`}
            formatCurrency={formatCurrency}
          />
        </section>

        {/* Quick actions */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <ActionBtn title="Transfer" icon={<ArrowsRightLeftIcon className="h-5 w-5" />} onClick={() => setActiveModal('transfer')} />
            <ActionBtn title="Pay bills" icon={<DocumentTextIcon className="h-5 w-5" />} onClick={() => setActiveModal('pay')} />
            <ActionBtn title="Deposit" icon={<BanknotesIcon className="h-5 w-5" />} onClick={() => setActiveModal('deposit')} />
            <ActionBtn title="Statements" icon={<DocumentTextIcon className="h-5 w-5" />} onClick={() => setActiveModal('statements')} />
          </div>
        </section>

        {/* Recent activity */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Recent activity</h2>
            <button
              type="button"
              onClick={() => setActiveModal('statements')}
              className="text-xs font-semibold text-[#117ACA] transition-colors hover:text-[#0d5f9e] hover:underline"
            >
              See all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/80">
                <div className="min-w-0 pr-4">
                  <p className="truncate text-sm font-medium text-slate-900">{tx.title}</p>
                  <p className="text-xs text-slate-500">{tx.category} · {tx.date}</p>
                </div>
                <p className={`shrink-0 text-sm font-bold tabular-nums ${tx.type === 'debit' ? 'text-slate-900' : 'text-emerald-600'}`}>
                  {tx.type === 'debit' ? '−' : '+'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {activeModal === 'transfer' && 'Transfer money'}
                {activeModal === 'pay' && 'Pay bills'}
                {activeModal === 'deposit' && 'Deposit a check'}
                {activeModal === 'statements' && 'Statements & documents'}
                {activeModal === 'alerts' && 'Alerts'}
                {activeModal === 'support' && 'Customer service'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              {activeModal === 'transfer' && (
                <form onSubmit={handleTransfer} className="space-y-5">
                  <div>
                    <label htmlFor="transfer-recipient" className="block text-sm font-semibold text-slate-900">
                      Transfer to
                    </label>
                    <p id="recipient-hint" className="mt-1 text-xs text-slate-500">
                      Enter recipient name, email, or account number.
                    </p>
                    <input
                      id="transfer-recipient"
                      type="text"
                      required
                      aria-describedby="recipient-hint"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      placeholder="Recipient name or account"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="transfer-amount" className="text-sm font-semibold text-slate-900">
                        Amount
                      </label>
                      <span className="text-xs text-slate-500">
                        Available: <strong className="ml-1 text-slate-900">{formatCurrency(account.availableBalance)}</strong>
                      </span>
                    </div>

                    <div className="relative mt-2">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                      <input
                        id="transfer-amount"
                        type="number"
                        required
                        min={0.01}
                        max={maxAllowedTransfer}
                        step="0.01"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex gap-3">
                      <ArrowsRightLeftIcon className="h-5 w-5 shrink-0 text-[#117ACA]" />
                      <div className="space-y-1 text-xs">
                        <p className="text-sm font-semibold text-slate-900">Transfer Summary</p>
                        <div className="flex justify-between text-slate-600">
                          <span>Transfer amount:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(parsedTransferAmount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Withdrawal fee (10%):</span>
                          <span className="font-medium text-amber-700">+{formatCurrency(calculatedFee)}</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-200/60 pt-1 font-semibold text-slate-900">
                          <span>Total deduction:</span>
                          <span>{formatCurrency(parsedTransferAmount + calculatedFee)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f9e] focus:ring-2 focus:ring-[#117ACA]"
                  >
                    Review transfer
                  </button>
                </form>
              )}
              {activeModal === 'pay' && (
                <form onSubmit={handleBillPay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Payee</label>
                    <input
                      type="text"
                      required
                      placeholder="Biller name"
                      value={billPayee}
                      onChange={(e) => setBillPayee(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f9e]">
                    Pay
                  </button>
                </form>
              )}
              {activeModal === 'deposit' && (
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Check amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                    />
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                    <BanknotesIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-xs font-medium text-slate-600">Capture front &amp; back of check</p>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f9e]">
                    Deposit
                  </button>
                </form>
              )}
              {activeModal === 'statements' && (
                <div className="space-y-2">
                  {STATEMENTS.map((stmt) => (
                    <div key={stmt.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50/80">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{stmt.monthYear}</p>
                        <p className="text-xs text-slate-500">{stmt.period}</p>
                      </div>
                      <button
                        type="button"
                        disabled={downloadingId === stmt.id}
                        onClick={() => downloadStatement(stmt)}
                        className="text-xs font-semibold text-[#117ACA] hover:underline disabled:opacity-50"
                      >
                        {downloadingId === stmt.id ? (
                          <span className="inline-flex items-center gap-1.5"><ArrowPathIcon className="h-4 w-4 animate-spin" />Downloading…</span>
                        ) : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === 'alerts' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-[#117ACA]">Account security status: Normal</p>
                  <p className="mt-1 text-xs text-slate-600">Two-step verification is enabled across all recognized devices.</p>
                </div>
              )}
              {activeModal === 'support' && (
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Private Client Dedicated Line</p>
                    <p className="text-base font-semibold text-slate-900">1-888-393-2000</p>
                    <p className="mt-2 text-xs text-slate-500">Your Advisor</p>
                    <p className="text-sm font-medium text-slate-800">Sarah Jenkins</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveModal(null); notify('Callback request submitted.'); }}
                    className="w-full rounded-xl bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f9e]"
                  >
                    Request a callback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 JPMorgan Chase &amp; Co.</p>
          <div className="flex flex-wrap justify-center gap-5">
            <button type="button" className="transition-colors hover:text-slate-900 hover:underline">Privacy</button>
            <button type="button" className="transition-colors hover:text-slate-900 hover:underline">Security</button>
            <button type="button" className="transition-colors hover:text-slate-900 hover:underline">Terms of use</button>
            <span className="font-medium text-slate-400">Member FDIC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ActionBtn({ title, icon, onClick }: { title: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-4 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#117ACA]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#117ACA] sm:text-sm"
    >
      <span className="text-[#117ACA] transition-transform group-hover:scale-110">{icon}</span>
      {title}
    </button>
  );
}

