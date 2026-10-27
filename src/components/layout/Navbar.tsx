import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  Settings as SettingsIcon,
  RotateCcw,
  Smartphone,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface NavbarProps {
  onNewTransaction: () => void;
  onOpenDataModal: () => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewTransaction,
  onOpenDataModal,
  onOpenSettings,
  onResetDemo,
  isDark,
  toggleTheme,
}) => {
  const { isInstallable, isInstalled, isIOS, installPWA } = usePWAInstall();
  const [showIosTip, setShowIosTip] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 flex-shrink-0">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">
                Personal Finance <span className="text-emerald-400">Pro</span>
              </span>
              <span className="hidden sm:flex text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Offline PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Zero cloud • Local IndexedDB</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-all shadow-sm animate-pulse"
              title="Install to Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* iOS Safari Install helper */}
          {isIOS && !isInstalled && (
            <div className="relative">
              <button
                onClick={() => setShowIosTip((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                title="How to install on iOS"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Install</span>
              </button>

              {showIosTip && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-300 z-50">
                  <div className="flex items-start gap-2 mb-1.5 font-semibold text-white">
                    <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Install on iPhone / iPad:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Tap the <strong>Share</strong> button (box with arrow ↑) in Safari.</li>
                    <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Quick Transaction Button */}
          <button
            onClick={onNewTransaction}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 active:scale-95"
            title="Log new transaction"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          {/* Backup / Export / Import */}
          <button
            onClick={onOpenDataModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Backup & Restore (JSON / CSV)"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Reset / Reload Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Settings & Currency"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
