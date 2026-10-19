import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users,
  Search,
  CreditCard,
  Printer,
  ShieldCheck,
  UserCheck,
  UserX,
  BookOpen,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MemberCardModal from '../components/common/MemberCardModal.jsx';

export const Members = () => {
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [patronFilter, setPatronFilter] = useState('all');
  const [cardMember, setCardMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (patronFilter !== 'all') params.append('patronType', patronFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success) {
        setMembers(res.users);
      }
    } catch (err) {
      toast.error('Failed to load member directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, patronFilter]);

  const handleToggleStatus = async (memberId, memberName, currentStatus) => {
    if (!isAdmin) {
      toast.error('Only Administrators can activate/deactivate accounts.');
      return;
    }
    try {
      const res = await api.patch(`/users/${memberId}/toggle-status`);
      if (res.success) {
        toast.success(res.message);
        fetchMembers();
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
            <Users className="w-3.5 h-3.5" />
            Patron Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Member & Patron Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student & faculty accounts, monitor borrowing quotas, and generate digital barcode ID cards.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or membership ID (e.g. MEM-2026-3003)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={patronFilter}
            onChange={(e) => setPatronFilter(e.target.value)}
            className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Patron Types</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="researcher">Researchers</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Patron</th>
                  <th className="py-3.5 px-4">Membership ID</th>
                  <th className="py-3.5 px-4">Patron Type</th>
                  <th className="py-3.5 px-4">Active Loans / Quota</th>
                  <th className="py-3.5 px-4">Unpaid Fines</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900">{m.name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{m.membershipId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 capitalize">
                        {m.patronType || m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{m.activeLoansCount || 0}</span>
                      <span className="text-slate-400"> of {m.maxBooksAllowed || 4} books</span>
                    </td>
                    <td className="py-3 px-4">
                      {(m.fineDue || 0) > 0 ? (
                        <span className="text-rose-600 font-bold">${m.fineDue.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Cleared ($0)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {m.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCardMember(m)}
                          title="Generate & Print Official ID Pass"
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ID Pass
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleToggleStatus(m._id, m.name, m.isActive)}
                            title={m.isActive ? 'Deactivate Member' : 'Activate Member'}
                            className={`p-1.5 rounded-lg transition ${
                              m.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {m.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
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
            No patrons found matching your search.
          </div>
        )}
      </div>

      {/* Member Card Modal */}
      {cardMember && (
        <MemberCardModal
          isOpen={!!cardMember}
          onClose={() => setCardMember(null)}
          member={cardMember}
        />
      )}
    </div>
  );
};

export default Members;
