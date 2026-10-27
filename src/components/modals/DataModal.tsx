import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { exportDatabaseToJson, importDatabaseFromJson, exportTransactionsToCsv, resetDatabase } from '../../db/database';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExportJson = async () => {
    try {
      const jsonString = await exportDatabaseToJson();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-finance-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Database exported successfully!', type: 'success' });
    } catch (err) {
      setStatusMessage({ text: 'Failed to export backup.', type: 'error' });
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvString = await exportTransactionsToCsv();
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-finance-pro-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'CSV transactions exported successfully!', type: 'success' });
    } catch (err) {
      setStatusMessage({ text: 'Failed to export CSV.', type: 'error' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await importDatabaseFromJson(content);
        setStatusMessage({ text: 'Database restored successfully!', type: 'success' });
        onDataChanged();
      } catch (err) {
        setStatusMessage({ text: 'Failed to restore: Invalid backup file format.', type: 'error' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = async (reseed: boolean) => {
    const message = reseed
      ? 'Reset all data and reload demo accounts & transactions?'
      : 'Erase ALL accounts and transactions and start completely blank?';
    if (!confirm(message)) return;

    try {
      await resetDatabase(reseed);
      setStatusMessage({ text: reseed ? 'Sample demo data reloaded!' : 'All data cleared!', type: 'success' });
      onDataChanged();
    } catch {
      setStatusMessage({ text: 'Failed to reset data.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Offline Data & Backups</h2>
            <p className="text-xs text-slate-400">100% locally stored in your browser. No telemetry or cloud.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {/* Export JSON */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-xs text-white">Full JSON Backup</div>
              <div className="text-[11px] text-slate-400">
                Exports all accounts, transactions, budgets, and goals to a portable JSON file.
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex-shrink-0 ml-3"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          {/* Import JSON */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-xs text-white">Restore Backup</div>
              <div className="text-[11px] text-slate-400">
                Load accounts and transactions from a previous Personal Finance Pro JSON backup.
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-500/20 hover:text-teal-300 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex-shrink-0 ml-3"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore
            </button>
          </div>

          {/* Export CSV */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-xs text-white">Export Transactions to CSV</div>
              <div className="text-[11px] text-slate-400">
                Compatible with Excel, Google Sheets, or LibreOffice Calc.
              </div>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 hover:text-blue-300 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex-shrink-0 ml-3"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {/* Reset / Reload Demo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 pt-4 mt-2">
            <div>
              <div className="font-semibold text-xs text-slate-300">Sample Demo Dataset</div>
              <div className="text-[11px] text-slate-400">
                Re-populate realistic demo accounts, budgets, and transactions.
              </div>
            </div>
            <button
              onClick={() => handleResetData(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex-shrink-0 ml-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Demo
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 flex justify-end border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
