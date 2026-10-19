import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import {
  Repeat,
  ScanLine,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  RotateCcw,
  Sparkles,
  Camera,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeScannerModal from '../components/common/BarcodeScannerModal.jsx';
import ReceiptModal from '../components/common/ReceiptModal.jsx';

export const CirculationDesk = () => {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue', 'return', 'active_loans'
  
  // Issue states
  const [memberId, setMemberId] = useState('');
  const [copyBarcode, setCopyBarcode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Return states
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');
  const [markAsLost, setMarkAsLost] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnLoanData, setReturnLoanData] = useState(null);
  const [paidReceipt, setPaidReceipt] = useState(null);

  // Active Loans list states
  const [loans, setLoans] = useState([]);
  const [loanFilter, setLoanFilter] = useState('all'); // all, overdue, due_today
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [renewingId, setRenewingId] = useState(null);

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(''); // 'issue_member', 'issue_copy', 'return_copy'

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.get(`/circulation/active?filter=${loanFilter}`);
      if (res.success) {
        setLoans(res.loans);
      }
    } catch (err) {
      toast.error('Failed to load active loans');
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'active_loans') {
      fetchLoans();
    }
  }, [activeTab, loanFilter]);

  // Issue Book handler
  const handleIssue = async (e) => {
    e.preventDefault();
    if (!memberId.trim() || !copyBarcode.trim()) {
      toast.error('Please provide both Member Identifier and Book Copy Barcode');
      return;
    }

    setIssuing(true);
    try {
      const res = await api.post('/circulation/issue', {
        memberIdentifier: memberId.trim(),
        copyBarcode: copyBarcode.trim(),
        remarks,
      });

      if (res.success) {
        toast.success(res.message);
        setCopyBarcode('');
        setRemarks('');
        // Keep memberId in case librarian is issuing multiple books to the same student!
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIssuing(false);
    }
  };

  // Inspect copy for return
  const handleInspectReturn = async (barcode) => {
    if (!barcode) return;
    try {
      const res = await api.get(`/copies/barcode/${barcode.trim()}`);
      if (res.success) {
        setReturnLoanData(res);
      }
    } catch (err) {
      toast.error(err.message);
      setReturnLoanData(null);
    }
  };

  // Return Book handler
  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnBarcode.trim()) {
      toast.error('Please provide copy barcode to return');
      return;
    }

    setReturning(true);
    try {
      const res = await api.post('/circulation/return', {
        copyBarcode: returnBarcode.trim(),
        returnCondition,
        markAsLost,
      });

      if (res.success) {
        toast.success(res.message);
        if (res.fine) {
          setPaidReceipt(res.fine);
        }
        setReturnBarcode('');
        setReturnLoanData(null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReturning(false);
    }
  };

  // Renew loan handler
  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    try {
      const res = await api.post(`/circulation/${loanId}/renew`);
      if (res.success) {
        toast.success(res.message);
        fetchLoans();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenewingId(null);
    }
  };

  // Scanner callback
  const handleScanComplete = (scannedText) => {
    if (scannerTarget === 'issue_member') {
      setMemberId(scannedText);
    } else if (scannerTarget === 'issue_copy') {
      setCopyBarcode(scannedText);
    } else if (scannerTarget === 'return_copy') {
      setReturnBarcode(scannedText);
      handleInspectReturn(scannedText);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5">
            <ScanLine className="w-3.5 h-3.5" />
            Front Desk Circulation Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Circulation Operations Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Barcode-driven rapid checkout, automated overdue fine calculation, and loan renewal verification.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm border">
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'issue'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Fast Checkout & Issue
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'return'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Quick Check-in & Returns
        </button>
        <button
          onClick={() => setActiveTab('active_loans')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'active_loans'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Active Loans & Overdue Registry
        </button>
      </div>

      {/* Tab: FAST ISSUE / CHECKOUT */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Check Out Items to Patron</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan patron membership card or enter email/ID, then scan the book physical copy barcode.
              </p>
            </div>

            <form onSubmit={handleIssue} className="space-y-5">
              {/* Member Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Patron Identifier (Membership ID, Email, or Scan)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. MEM-2026-3003 or student@athena.edu"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('issue_member');
                      setScannerOpen(true);
                    }}
                    title="Scan Member Barcode"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Camera className="w-4 h-4" />
                    Scan
                  </button>
                </div>
              </div>

              {/* Copy Barcode Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Book Physical Copy Barcode
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. BC-3320-1-1001"
                      value={copyBarcode}
                      onChange={(e) => setCopyBarcode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('issue_copy');
                      setScannerOpen(true);
                    }}
                    title="Scan Copy Barcode"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Camera className="w-4 h-4" />
                    Scan
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Librarian Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reserved for semester research project"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={issuing || !memberId.trim() || !copyBarcode.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {issuing ? 'Validating & Issuing...' : 'Complete Checkout & Issue'}
              </button>
            </form>
          </div>

          {/* Policy Information Side Panel */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Automated Checkout Rules
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="font-bold text-slate-800">Borrowing Quotas:</span>
                <p>• Students: Max 4 active books (14 days)</p>
                <p>• Faculty: Max 10 active books (30 days)</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="font-bold text-slate-800">Automatic Fine Suspension:</span>
                <p>Patrons with outstanding unpaid fines above $20.00 are restricted from new checkouts until cleared.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="font-bold text-slate-800">Hold Priority:</span>
                <p>If a book copy is currently reserved for a waiting patron, the system prevents unauthorized checkout to others.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: QUICK RETURN / CHECK-IN */}
      {activeTab === 'return' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Check In Returned Book</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan or enter the physical copy barcode. Overdue fines and condition checks are calculated automatically.
              </p>
            </div>

            <form onSubmit={handleReturn} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Book Copy Barcode
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. BC-5088-1-2001"
                      value={returnBarcode}
                      onChange={(e) => {
                        setReturnBarcode(e.target.value);
                        if (e.target.value.length >= 8) handleInspectReturn(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('return_copy');
                      setScannerOpen(true);
                    }}
                    title="Scan Copy Barcode"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Camera className="w-4 h-4" />
                    Scan
                  </button>
                </div>
              </div>

              {/* Inspected Loan Card */}
              {returnLoanData?.activeLoan && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Active Borrowing Found</h4>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{returnLoanData.copy?.book?.title}</p>
                      <p className="text-xs text-slate-600">
                        Borrower: <span className="font-semibold text-slate-900">{returnLoanData.activeLoan.member?.name}</span> ({returnLoanData.activeLoan.member?.membershipId})
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-xs">
                      Due: {new Date(returnLoanData.activeLoan.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {new Date(returnLoanData.activeLoan.dueDate) < new Date() && (
                    <div className="p-2.5 bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Notice: This item is overdue! Overdue penalty will be billed to member account.
                    </div>
                  )}
                </div>
              )}

              {/* Condition on return */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Return Condition
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="New">Like New</option>
                    <option value="Good">Good Condition</option>
                    <option value="Worn">Worn / Dog-eared</option>
                    <option value="Damaged">Damaged (Assessment Required)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markAsLost}
                      onChange={(e) => setMarkAsLost(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    Mark Copy as Lost (Bill Replacement Fee)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={returning || !returnBarcode.trim()}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {returning ? 'Processing Return...' : 'Confirm Return & Check-in'}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600" />
              Automated Return Automation
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <p>• <strong>Grace Periods:</strong> 1-day grace period is granted before fine accrual begins.</p>
              <p>• <strong>Hold Queue Fulfillment:</strong> If other patrons are in queue for this title, the returned copy is immediately flagged as <span className="text-amber-700 font-bold">Reserved</span> with a 48-hour pickup window.</p>
              <p>• <strong>Digital Receipts:</strong> If a penalty fine is settled upon return, a digital printable receipt is generated automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: ACTIVE LOANS MANAGER */}
      {activeTab === 'active_loans' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Borrowing Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage live loans, renewals, and overdue items</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoanFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  loanFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Active ({loans.length})
              </button>
              <button
                onClick={() => setLoanFilter('overdue')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  loanFilter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overdue Only
              </button>
              <button
                onClick={() => setLoanFilter('due_today')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  loanFilter === 'due_today'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Due Today
              </button>
            </div>
          </div>

          {loadingLoans ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : loans.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Copy Barcode</th>
                    <th className="py-3 px-4">Patron Name</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Renewals</th>
                    <th className="py-3 px-4">Status & Fines</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">{loan.transactionId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{loan.book?.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{loan.copy?.barcode}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{loan.member?.name}</span>
                        <p className="text-[10px] text-slate-400 font-mono">{loan.member?.membershipId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${loan.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                        {loan.isOverdue && (
                          <p className="text-[10px] text-rose-500 font-bold">{loan.daysOverdue} days overdue</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {loan.renewCount} of {loan.maxRenewals}
                      </td>
                      <td className="py-3 px-4">
                        {loan.isOverdue ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue (${loan.currentEstimatedFine?.toFixed(2)})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRenew(loan._id)}
                          disabled={renewingId === loan._id || loan.renewCount >= loan.maxRenewals}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition disabled:opacity-40"
                        >
                          {renewingId === loan._id ? 'Renewing...' : 'Renew (+14d)'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active loans recorded under this filter.
            </div>
          )}
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanComplete}
        title={
          scannerTarget === 'issue_member'
            ? 'Scan Patron Membership Barcode'
            : 'Scan Book Copy Barcode'
        }
      />

      {/* Printable Receipt Modal */}
      {paidReceipt && (
        <ReceiptModal
          isOpen={!!paidReceipt}
          onClose={() => setPaidReceipt(null)}
          fine={paidReceipt}
        />
      )}
    </div>
  );
};

export default CirculationDesk;
