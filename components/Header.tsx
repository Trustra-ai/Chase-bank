'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  customerName: string;
  customerInitials: string;
  tier: string;
  onSignOut: () => void;
}

const navigation = [
  {
    href: '/',
    text: 'Dashboard',
  },
  {
    href: '/accounts',
    text: 'Accounts',
  },
  {
    href: '/transfers',
    text: 'Transfers',
  },
  {
    href: '/cards',
    text: 'Cards',
  },
];

export default function Header({
  customerName,
  customerInitials,
  tier,
  onSignOut,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-slate-900 text-[11px] font-medium text-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6 lg:px-8">
          <span>Online Portal</span>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-white"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                Support
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1 hover:text-white"
            >
              <BellIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                Alerts
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">

          {/* Brand + desktop navigation */}
          <div className="flex items-center gap-6">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
                F
              </div>

              <div>
                <p className="text-lg font-bold tracking-wide text-slate-900">
                  Finance Portal
                </p>

                <p className="text-xs text-slate-500">
                  Secure Dashboard
                </p>
              </div>
            </Link>


            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item, index) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  text={item.text}
                  active={index === 0}
                />
              ))}
            </nav>

          </div>


          {/* User section */}
          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {customerName}
              </p>

              <p className="text-xs text-slate-500">
                {tier}
              </p>
            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {customerInitials}
            </div>


            <button
              type="button"
              onClick={onSignOut}
              className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600 sm:flex"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>


            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

          </div>

        </div>


        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-3 py-3 lg:hidden">

            <nav className="flex flex-col gap-1">

              {navigation.map((item) => (
                <MobileItem
                  key={item.href}
                  href={item.href}
                  text={item.text}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}


              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Sign out
              </button>

            </nav>

          </div>
        )}

      </header>
    </>
  );
}


function NavItem({
  href,
  text,
  active = false,
}: {
  href: string;
  text: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {text}
    </Link>
  );
}


function MobileItem({
  href,
  text,
  onClick,
}: {
  href: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
    >
      {text}
    </Link>
  );
}
