import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import Barcode from './Barcode.jsx';

export const ReceiptModal = ({ isOpen, onClose, fine }) => {
  if (!isOpen || !fine) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptDate = fine.paymentDate ? new Date(fine.paymentDate).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Actions header - hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 no-print">
          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Official Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div className="p-8 text-slate-800 space-y-6 bg-slate-50/50">
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">ATHENA CENTRAL LIBRARY</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Official Financial Transaction Record</p>
            <p className="text-xs text-slate-400">Date: {receiptDate}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-mono font-bold text-slate-900">{fine.receiptNumber || 'RCP-ONLINE'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Fine Reference ID:</span>
              <span className="font-mono text-slate-800">{fine.fineId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Member:</span>
              <span className="font-semibold text-slate-900">{fine.member?.name || 'Patron'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Membership ID:</span>
              <span className="font-mono text-slate-800">{fine.member?.membershipId || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Penalty Reason:</span>
              <span className="capitalize font-medium text-slate-800">{fine.type?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="uppercase font-semibold text-slate-800">{fine.paymentMethod || 'CASH'}</span>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Amount Cleared</p>
              <p className="text-xs text-emerald-600">Status: PAID IN FULL</p>
            </div>
            <span className="text-2xl font-black text-emerald-700">${fine.amount?.toFixed(2)}</span>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <Barcode value={fine.receiptNumber || fine.fineId} height={36} width={1.4} fontSize={10} />
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Thank you for keeping our library collection accessible to all.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
