import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookMarked,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  BookmarkCheck,
  CreditCard,
  History,
  Printer,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MemberCardModal from '../components/common/MemberCardModal.jsx';
import ReceiptModal from '../components/common/ReceiptModal.jsx';

export const PatronPortal = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans'); // loans, holds, fines, history
  const [renewingId, setRenewingId] = useState(null);

  // Modals
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [receiptFine, setReceiptFine] = useState(null);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [loansRes, holdsRes, finesRes] = await Promise.all([
        api.get('/circulation/my-loans'),
        api.get('/reservations'),
        api.get('/fines'),
      ]);

      if (loansRes.success) {
        setActiveLoans(loansRes.activeLoans || []);
        setHistory(loansRes.history || []);
      }
      if (holdsRes.success) {
        setReservations(holdsRes.reservations || []);
      }
      if (finesRes.success) {
        setFines(finesRes.fines || []);
      }
    } catch (err) {
      toast.error('Failed to load patron portal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    try {
      const res = await api.post(`/circulation/${loanId}/renew`);
      if (res.success) {
        toast.success(res.message);
        fetchPortalData();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenewingId(null);
    }
  };

  const handleCancelHold = async (resId) => {
    if (!window.confirm('Cancel this hold reservation?')) return;
    try {
      const res = await api.delete(`/reservations/${resId}`);
      if (res.success) {
        toast.success(res.message);
        fetchPortalData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center space-y-3">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700">Please sign in to access your Patron Portal</h3>
      </div>
    );
  }

  const unpaidTotal = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Patron Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-700/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-indigo-400/30 overflow-hidden flex-shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-white/10 border border-white/20 capitalize">
                {user.patronType || user.role}
              </span>
            </div>
            <p className="text-xs text-indigo-200 font-mono mt-0.5">Membership ID: {user.membershipId}</p>
            <p className="text-[11px] text-indigo-300/80">Borrowing Quota: {activeLoans.length} of {user.maxBooksAllowed || 4} items</p>
          </div>
        </div>

        <button
          onClick={() => setCardModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 self-start md:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          View Digital Library Card
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm border">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'loans'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Active Loans ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('holds')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'holds'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          My Holds ({reservations.length})
        </button>
        <button
          onClick={() => setActiveTab('fines')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'fines'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Fines & Receipts {unpaidTotal > 0 && `($${unpaidTotal.toFixed(2)})`}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Reading History
        </button>
      </div>

      {/* Tab: ACTIVE LOANS */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={loan.book?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                      alt={loan.book?.title}
                      className="w-14 h-20 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {loan.book?.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{loan.book?.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{loan.book?.authors?.join(', ')}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">Barcode: {loan.copy?.barcode}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[11px] text-slate-400">Due Date:</p>
                      <span className={`font-bold ${loan.isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                      {loan.isOverdue && (
                        <p className="text-[10px] font-bold text-rose-500">
                          {loan.daysOverdue} days overdue (Fine: ${loan.currentEstimatedFine?.toFixed(2)})
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRenew(loan._id)}
                      disabled={renewingId === loan._id || loan.renewCount >= loan.maxRenewals}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-40 font-bold rounded-xl text-xs transition"
                    >
                      {renewingId === loan._id ? 'Renewing...' : `Renew (+14d) [${loan.renewCount}/${loan.maxRenewals}]`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800">You currently have no books checked out</h4>
              <p className="text-xs text-slate-400">Visit the Catalog (OPAC) to discover and borrow titles.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: MY HOLDS */}
      {activeTab === 'holds' && (
        <div className="space-y-4">
          {reservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => (
                <div
                  key={res._id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={res.book?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                      alt={res.book?.title}
                      className="w-14 h-20 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{res.book?.title}</h4>
                      <p className="text-xs text-slate-500 font-mono">ISBN: {res.book?.isbn}</p>

                      <div className="mt-2">
                        {res.status === 'ready_for_pickup' ? (
                          <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Ready for Pickup at Circulation Desk!
                          </div>
                        ) : res.status === 'waiting' ? (
                          <div className="p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            Position #{res.queuePosition} in Queue
                          </div>
                        ) : (
                          <span className="text-xs capitalize text-slate-500">{res.status}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Requested: {new Date(res.requestDate || res.createdAt).toLocaleDateString()}
                    </span>
                    {['waiting', 'ready_for_pickup'].includes(res.status) && (
                      <button
                        onClick={() => handleCancelHold(res._id)}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Cancel Hold
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">No active holds or reservations</h4>
            </div>
          )}
        </div>
      )}

      {/* Tab: FINES & RECEIPTS */}
      {activeTab === 'fines' && (
        <div className="space-y-4">
          {fines.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fine ID</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{f.fineId}</td>
                      <td className="py-3 px-4 capitalize font-medium text-slate-800">{f.type?.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${f.amount?.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            f.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {f.status === 'paid' && (
                          <button
                            onClick={() => setReceiptFine(f)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800">Clear Financial Record</h4>
              <p className="text-xs text-slate-400">You have no unpaid fines or penalties.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: READING HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Past Completed Loans</h3>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{h.book?.title}</h5>
                    <p className="text-[11px] text-slate-400">
                      Borrowed: {new Date(h.issueDate).toLocaleDateString()} • Returned: {new Date(h.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px]">
                    Returned in {h.returnCondition || 'Good'} condition
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No completed borrowings yet.</p>
          )}
        </div>
      )}

      {/* Modals */}
      {cardModalOpen && (
        <MemberCardModal
          isOpen={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
          member={user}
        />
      )}

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

export default PatronPortal;
