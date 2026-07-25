'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  lastSignIn: 'Today, 1:04 PM',
};

const INITIAL_TXNS: TransactionItem[] = [
  { id: '1', title: 'ATM Withdrawal', category: 'Cash & ATM', date: 'Today, 10:14 AM', amount: 9900, type: 'debit' },
  { id: '2', title: 'Salary Deposit', category: 'Payroll', date: 'Yesterday', amount: 120000, type: 'credit' },
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
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billPayee, setBillPayee] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Auth guard
  useEffect(() => {
    const authed = localStorage.getItem('chase_auth') === '1';
    if (!authed) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('chase_auth');
    localStorage.removeItem('chase_remember');
    router.replace('/login');
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(transferAmount);
    if (isNaN(val) || val <= 0 || val > account.availableBalance) return;
    setAccount((p) => ({
      ...p,
      availableBalance: p.availableBalance - val,
      checkingBalance: p.checkingBalance - val,
    }));
    setTransactions((p) => [
      { id: `tx-${Date.now()}`, title: `Transfer to ${transferRecipient || 'Recipient'}`, category: 'Transfer', date: 'Just now', amount: val, type: 'debit' },
      ...p,
    ]);
    notify(`Transferred ${formatCurrency(val)}`);
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
      const content = `Chase Statement - ${stmt.monthYear}\nCustomer: ${account.customerName}\nBalance: ${formatCurrency(account.availableBalance)}\n`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = stmt.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadingId(null);
      notify(`Downloaded ${stmt.monthYear}`);
    }, 700);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f5f7fa] font-sans text-slate-900 antialiased">
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex max-w-[90vw] items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-xl sm:px-5 sm:py-3.5">
          <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Utility bar */}
      <div className="bg-[#0a2540] text-[11px] font-medium text-blue-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6 lg:px-8">
          <span>Chase Online</span>
          <div className="flex items-center gap-3 sm:gap-5">
            <button type="button" onClick={() => setActiveModal('support')} className="flex items-center gap-1 hover:text-white">
              <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Customer service</span>
            </button>
            <button type="button" onClick={() => setActiveModal('alerts')} className="flex items-center gap-1 hover:text-white">
              <BellIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
          </div>
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
              <span className="text-lg font-bold tracking-[0.12em] text-white sm:text-xl">CHASE</span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm font-medium text-blue-50 lg:flex">
              <Link href="/" className="rounded bg-white/15 px-3 py-1.5 text-white">Accounts</Link>
              <Link href="/transfers" className="rounded px-3 py-1.5 hover:bg-white/10 hover:text-white">Pay &amp; transfer</Link>
              <Link href="/cards" className="rounded px-3 py-1.5 hover:bg-white/10 hover:text-white">Credit cards</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right text-white sm:block">
              <p className="text-sm font-semibold leading-tight">{account.customerName}</p>
              <p className="text-[11px] text-blue-100">{account.tier}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#117ACA]">
              {account.customerInitials}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded p-1.5 text-blue-50 hover:bg-white/10 sm:inline-flex"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
            <button type="button" className="rounded p-1.5 text-blue-50 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-blue-600 bg-[#0e6bb5] px-3 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium text-white">
              <Link href="/" className="rounded px-3 py-2 bg-white/15" onClick={() => setMobileMenuOpen(false)}>Accounts</Link>
              <Link href="/transfers" className="rounded px-3 py-2 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Pay &amp; transfer</Link>
              <Link href="/cards" className="rounded px-3 py-2 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Credit cards</Link>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                className="rounded px-3 py-2 text-left hover:bg-white/10"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Good afternoon, {account.customerName.split(' ')[0]}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Last sign-in: {account.lastSignIn}</p>
        </div>

        {/* Account cards */}
        <section className="mb-6 grid gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <AccountCard
            icon={<BanknotesIcon className="h-5 w-5" />}
            iconBg="bg-[#117ACA]"
            title={account.accountType}
            number={account.accountNumberMasked}
            label="Available balance"
            balance={account.checkingBalance}
            footer="Present balance same"
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
          />
          <AccountCard
            icon={<CreditCardIcon className="h-5 w-5" />}
            iconBg="bg-violet-700"
            title="Chase Sapphire Preferred"
            number="•••• 7712"
            label="Current balance"
            balance={account.cardBalance}
            footer={`Available credit ${formatCurrency(15000 - account.cardBalance)}`}
          />
        </section>

        {/* Quick actions */}
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <ActionBtn title="Transfer" icon={<ArrowsRightLeftIcon className="h-5 w-5" />} onClick={() => setActiveModal('transfer')} />
            <ActionBtn title="Pay bills" icon={<DocumentTextIcon className="h-5 w-5" />} onClick={() => setActiveModal('pay')} />
            <ActionBtn title="Deposit" icon={<BanknotesIcon className="h-5 w-5" />} onClick={() => setActiveModal('deposit')} />
            <ActionBtn title="Statements" icon={<DocumentTextIcon className="h-5 w-5" />} onClick={() => setActiveModal('statements')} />
          </div>
        </section>

        {/* Recent activity */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            <button type="button" onClick={() => setActiveModal('statements')} className="text-sm font-semibold text-[#117ACA] hover:underline">
              See all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-slate-50">
                <div className="min-w-0 pr-3">
                  <p className="truncate text-sm font-medium text-slate-900">{tx.title}</p>
                  <p className="text-xs text-slate-500">{tx.category} · {tx.date}</p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${tx.type === 'debit' ? 'text-slate-900' : 'text-emerald-600'}`}>
                  {tx.type === 'debit' ? '−' : '+'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {activeModal === 'transfer' && 'Transfer money'}
                {activeModal === 'pay' && 'Pay bills'}
                {activeModal === 'deposit' && 'Deposit a check'}
                {activeModal === 'statements' && 'Statements & documents'}
                {activeModal === 'alerts' && 'Alerts'}
                {activeModal === 'support' && 'Customer service'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {activeModal === 'transfer' && (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">To</label>
                    <input type="text" required placeholder="Name or account" value={transferRecipient} onChange={(e) => setTransferRecipient(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Amount</label>
                    <input type="number" step="0.01" required placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20" />
                  </div>
                  <button type="submit" className="w-full rounded-md bg-[#117ACA] py-2.5 text-sm font-semibold text-white hover:bg-[#0e6bb5]">Continue</button>
                </form>
              )}
              {activeModal === 'pay' && (
                <form onSubmit={handleBillPay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Payee</label>
                    <input type="text" required placeholder="Biller name" value={billPayee} onChange={(e) => setBillPayee(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Amount</label>
                    <input type="number" step="0.01" required placeholder="0.00" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20" />
                  </div>
                  <button type="submit" className="w-full rounded-md bg-[#117ACA] py-2.5 text-sm font-semibold text-white hover:bg-[#0e6bb5]">Pay</button>
                </form>
              )}
              {activeModal === 'deposit' && (
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Check amount</label>
                    <input type="number" step="0.01" required placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20" />
                  </div>
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                    <BanknotesIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm font-medium text-slate-600">Capture front &amp; back of check</p>
                  </div>
                  <button type="submit" className="w-full rounded-md bg-[#117ACA] py-2.5 text-sm font-semibold text-white hover:bg-[#0e6bb5]">Deposit</button>
                </form>
              )}
              {activeModal === 'statements' && (
                <div className="space-y-2">
                  {STATEMENTS.map((stmt) => (
                    <div key={stmt.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{stmt.monthYear}</p>
                        <p className="text-xs text-slate-500">{stmt.period}</p>
                      </div>
                      <button type="button" disabled={downloadingId === stmt.id} onClick={() => downloadStatement(stmt)} className="text-sm font-semibold text-[#117ACA] hover:underline disabled:opacity-50">
                        {downloadingId === stmt.id ? (
                          <span className="inline-flex items-center gap-1"><ArrowPathIcon className="h-4 w-4 animate-spin" />Downloading…</span>
                        ) : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === 'alerts' && (
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-[#117ACA]">Account security status: Normal</p>
                  <p className="mt-1 text-xs">Two-step verification is on.</p>
                </div>
              )}
              {activeModal === 'support' && (
                <div className="space-y-3 text-sm text-slate-600">
                  <p><strong>Private Client line:</strong> 1-888-393-2000</p>
                  <p><strong>Your advisor:</strong> Sarah Jenkins</p>
                  <button type="button" onClick={() => { setActiveModal(null); notify('Callback request submitted.'); }} className="mt-2 w-full rounded-md bg-[#117ACA] py-2.5 text-sm font-semibold text-white hover:bg-[#0e6bb5]">
                    Request a callback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 bg-white py-5 text-xs text-slate-500 sm:mt-12 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 JPMorgan Chase &amp; Co.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            <button type="button" className="hover:underline">Privacy</button>
            <button type="button" className="hover:underline">Security</button>
            <button type="button" className="hover:underline">Terms of use</button>
            <span>Member FDIC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AccountCard({
  icon, iconBg, title, number, label, balance, footer, onActivity,
}: {
  icon: ReactNode; iconBg: string; title: string; number: string; label: string; balance: number; footer: string; onActivity?: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white sm:h-10 sm:w-10 ${iconBg}`}>{icon}</div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{number}</p>
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{formatCurrency(balance)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs sm:mt-4">
        <span className="text-slate-500">{footer}</span>
        {onActivity && (
          <button type="button" onClick={onActivity} className="font-semibold text-[#117ACA] hover:underline">View activity</button>
        )}
      </div>
    </article>
  );
}

function ActionBtn({ title, icon, onClick }: { title: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-3.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[#117ACA] hover:text-[#117ACA] sm:gap-2 sm:px-3 sm:py-4 sm:text-sm">
      <span className="text-[#117ACA]">{icon}</span>
      {title}
    </button>
  );
}
