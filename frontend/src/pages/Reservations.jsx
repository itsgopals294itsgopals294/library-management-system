import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookmarkCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  User,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reservations = () => {
  const { user, isStaff } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      const res = await api.get(`/reservations?${params.toString()}`);
      if (res.success) {
        setReservations(res.reservations);
      }
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this hold reservation?')) return;
    try {
      const res = await api.delete(`/reservations/${id}`);
      if (res.success) {
        toast.success(res.message);
        fetchReservations();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Hold Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hold Reservations & Queues
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track waiting queues, automatic item allocations, and pickup expiration windows.
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
            All Holds
          </button>
          <button
            onClick={() => setFilter('ready_for_pickup')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'ready_for_pickup' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ready for Pickup
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'waiting' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Waiting in Queue
          </button>
        </div>
      </div>

      {/* Reservation List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Title & Cover</th>
                  <th className="py-3.5 px-4">Patron Name</th>
                  <th className="py-3.5 px-4">Queue Status</th>
                  <th className="py-3.5 px-4">Allocated Copy</th>
                  <th className="py-3.5 px-4">Pickup Expiration</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={res.book?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                          alt={res.book?.title}
                          className="w-8 h-11 object-cover rounded border border-slate-200 shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 truncate">{res.book?.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">ISBN: {res.book?.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{res.member?.name}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{res.member?.membershipId}</p>
                    </td>
                    <td className="py-3 px-4">
                      {res.status === 'ready_for_pickup' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ready for Pickup!
                        </span>
                      ) : res.status === 'waiting' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <Clock className="w-3.5 h-3.5" />
                          Position #{res.queuePosition} in Queue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 capitalize">
                          {res.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {res.allocatedCopy ? (
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {res.allocatedCopy?.barcode}
                        </span>
                      ) : (
                        <span className="text-slate-400">Waiting for check-in</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {res.pickupExpiryDate ? (
                        <div>
                          <span className="font-semibold text-rose-600">
                            {new Date(res.pickupExpiryDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <p className="text-[10px] text-slate-400">Hold window</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {['waiting', 'ready_for_pickup'].includes(res.status) && (
                        <button
                          onClick={() => handleCancel(res._id)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-lg transition"
                        >
                          Cancel Hold
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No active reservations found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
