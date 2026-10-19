import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { ShieldAlert, Search, Filter, Clock, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (actionFilter !== 'all') params.append('action', actionFilter);
      const res = await api.get(`/analytics/audit-logs?${params.toString()}`);
      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Audit Trails
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-proof record of every circulation transaction, fine waiver, and inventory modification.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 self-start sm:self-auto"
        >
          <option value="all">All System Events</option>
          <option value="BOOK_CHECKOUT">Checkouts</option>
          <option value="BOOK_RETURNED">Returns</option>
          <option value="FINE_PAID">Fine Payments</option>
          <option value="FINE_WAIVED">Fine Waivers</option>
          <option value="BOOK_CREATED">Book Cataloging</option>
          <option value="USER_LOGIN">User Logins</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Audit Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{log.actorName}</td>
                    <td className="py-3 px-4 uppercase text-slate-500">{log.actorRole}</td>
                    <td className="py-3 px-4 text-slate-700">{log.targetType || '—'}</td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No audit logs found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
