import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookOpen,
  Boxes,
  Repeat,
  AlertCircle,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  ScanLine,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard = () => {
  const { user, isStaff } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading library intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Circulation Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to Athena Library Desk, {user?.name || 'Librarian'}!
            </h1>
            <p className="text-indigo-200/80 text-sm max-w-xl">
              Track multi-copy inventory, process high-speed barcode checkout/returns, enforce dynamic overdue policies, and manage hold reservations seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/circulation"
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              Circulation Desk
            </Link>
            <Link
              to="/inventory"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Book via ISBN
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Titles & Copies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Catalog Titles</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalTitles || 0}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-indigo-500" />
              <span>{kpis.totalPhysicalCopies || 0} physical copies tracked</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Active Circulations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Checked Out</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.activeLoans || 0}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{kpis.availableCopies || 0} copies ready on shelves</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Repeat className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Loans Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Items</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{kpis.overdueLoans || 0}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Accruing tiered daily fines</span>
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Fines Collected vs Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue & Penalties</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${kpis.finesCollected?.toFixed(2) || '0.00'}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1.5">
              ${kpis.finesPending?.toFixed(2) || '0.00'} outstanding unpaid
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Trend Chart (Area) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Circulation Activity (Checkouts vs Returns)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time loan trends across recent periods</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Monthly Flow
            </span>
          </div>

          <div className="h-64 w-full">
            {data?.circulationTrends && data.circulationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.circulationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCheckouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkouts"
                    name="Checkouts"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCheckouts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    name="Returns"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                No circulation history yet. Issue or return items to see trends.
              </div>
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Collection by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">Physical distribution across genres</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {data.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No categories</span>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {data?.categoryStats?.slice(0, 4).map((cat, i) => (
              <div key={cat._id} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 truncate">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {cat._id}
                </span>
                <span className="font-semibold text-slate-900">{cat.count} titles</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Top Borrowed Titles & Live Activity Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Books */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Most Circulated Titles</h3>
            <Link to="/catalog" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.topBorrowed && data.topBorrowed.length > 0 ? (
              data.topBorrowed.map((b, idx) => (
                <div
                  key={b._id || idx}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                >
                  <span className="text-sm font-extrabold text-slate-300 w-4 text-center">#{idx + 1}</span>
                  <img
                    src={b.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                    alt={b.title}
                    className="w-10 h-14 object-cover rounded-lg shadow-sm border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{b.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{b.authors?.join(', ')}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                      {b.category}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{b.borrowCount}</span>
                    <p className="text-[10px] text-slate-400">checkouts</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No circulation records recorded yet.</p>
            )}
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Activity Trail</h3>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Auditing
            </span>
          </div>

          <div className="space-y-3">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 5).map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 text-xs"
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs text-indigo-600 border border-slate-200/60 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                      By <span className="font-semibold text-slate-700">{log.actorName}</span> • Target: {log.targetType || 'Item'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
