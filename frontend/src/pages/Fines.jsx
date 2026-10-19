import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Printer,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/common/ReceiptModal.jsx';

export const Fines = () => {
  const { user, isStaff } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [summary, setSummary] = useState([]);

  // Pay modal
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Waive modal
  const [waiveTarget, setWaiveTarget] = useState(null);
  const [waiveReason, setWaiveReason] = useState('Administrative discretion / System adjustment');
  const [submittingWaive, setSubmittingWaive] = useState(false);

  // Receipt modal
  const [receiptFine, setReceiptFine] = useState(null);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      const res = await api.get(`/fines?${params.toString()}`);
      if (res.success) {
        setFines(res.fines);
        setSummary(res.summary);
      }
    } catch (err) {
      toast.error('Failed to load fines ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [filter]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    setSubmittingPayment(true);
    try {
      const res = await api.post(`/fines/${selectedFine._id}/pay`, { paymentMethod });
      if (res.success) {
        toast.success(res.message);
        setSelectedFine(null);
        fetchFines();
        setReceiptFine(res.fine);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleWaive = async (e) => {
    e.preventDefault();
    if (!waiveTarget) return;
    setSubmittingWaive(true);
    try {
      const res = await api.post(`/fines/${waiveTarget._id}/waive`, { reason: waiveReason });
      if (res.success) {
        toast.success(res.message);
        setWaiveTarget(null);
        fetchFines();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingWaive(false);
    }
  };

  let totalUnpaid = 0;
  let totalPaid = 0;
  let totalWaived = 0;
  summary.forEach((s) => {
    if (s._id === 'unpaid') totalUnpaid = s.totalAmount;
    if (s._id === 'paid') totalPaid = s.totalAmount;
    if (s._id === 'waived') totalWaived = s.totalAmount;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Financial Audit Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fines, Penalties & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overdue penalty ledger, lost item replacement costs, digital receipt generation, and waivers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Ledger
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'unpaid' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unpaid Dues
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Paid Receipts
          </button>
          <button
            onClick={() => setFilter('waived')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'waived' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Waived
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Total Unpaid Penalties</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">${totalUnpaid.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Collected Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">${totalPaid.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Waived Fines</p>
            <h3 className="text-2xl font-bold text-slate-700 mt-1">${totalWaived.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Fine ID</th>
                  <th className="py-3.5 px-4">Patron Name</th>
                  <th className="py-3.5 px-4">Reason / Title</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{f.fineId}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{f.member?.name}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{f.member?.membershipId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 capitalize">
                        {f.type?.replace('_', ' ')}
                      </span>
                      {f.daysOverdue > 0 && (
                        <p className="text-[10px] text-slate-400">{f.daysOverdue} days overdue</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ${f.amount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono uppercase text-slate-600">
                      {f.paymentMethod || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          f.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : f.status === 'unpaid'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {f.status === 'unpaid' && isStaff && (
                          <>
                            <button
                              onClick={() => setSelectedFine(f)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                            >
                              Collect Pay
                            </button>
                            <button
                              onClick={() => setWaiveTarget(f)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                            >
                              Waive
                            </button>
                          </>
                        )}

                        {f.status === 'paid' && (
                          <button
                            onClick={() => setReceiptFine(f)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No fines found under this filter.
          </div>
        )}
      </div>

      {/* Pay Fine Modal */}
      {selectedFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Collect Fine Payment
              </h3>
              <button
                onClick={() => setSelectedFine(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Due</p>
                <h2 className="text-3xl font-black text-emerald-700 mt-1">${selectedFine.amount?.toFixed(2)}</h2>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Member: {selectedFine.member?.name} ({selectedFine.member?.membershipId})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="cash">Cash at Circulation Desk</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="upi">UPI / QR Payment</option>
                  <option value="online">Online Student Account</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFine(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {submittingPayment ? 'Recording...' : 'Confirm Payment & Print Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {waiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Waive Fine Penalty</h3>
              <button
                onClick={() => setWaiveTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWaive} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                You are about to waive the fine of <span className="font-bold text-slate-900">${waiveTarget.amount?.toFixed(2)}</span> for {waiveTarget.member?.name}.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Waiver *</label>
                <textarea
                  rows={3}
                  required
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaiveTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWaive}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {submittingWaive ? 'Processing...' : 'Authorize Waiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptFine && (
        <ReceiptModal
          isOpen={!!receiptFine}
          onClose={() => setReceiptFine(null)}
          fine={receiptFine}
        />
      )}
    </div>
  );
};

export default Fines;
