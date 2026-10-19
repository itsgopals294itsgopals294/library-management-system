import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Settings as SettingsIcon, Save, ShieldAlert, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (err) {
      toast.error('Failed to load library settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only Administrators are authorized to update library policies.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5">
          <SettingsIcon className="w-3.5 h-3.5" />
          Policy Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Library Rules & Parameters
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure loan durations, automated tiered penalty rates, grace periods, and hold expiration limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Circulation Durations & Quotas */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
            Circulation Durations & Quotas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Loan Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.defaultLoanDaysStudent || 14}
                onChange={(e) => handleChange('defaultLoanDaysStudent', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Loan Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.defaultLoanDaysFaculty || 30}
                onChange={(e) => handleChange('defaultLoanDaysFaculty', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Books per Student
              </label>
              <input
                type="number"
                min="1"
                value={settings?.maxBooksStudent || 4}
                onChange={(e) => handleChange('maxBooksStudent', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Books per Faculty Member
              </label>
              <input
                type="number"
                min="1"
                value={settings?.maxBooksFaculty || 10}
                onChange={(e) => handleChange('maxBooksFaculty', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Fines & Penalties */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
            Overdue Fines & Penalty Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grace Period (Days)
              </label>
              <input
                type="number"
                min="0"
                value={settings?.gracePeriodDays ?? 1}
                onChange={(e) => handleChange('gracePeriodDays', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Days before fine begins</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Overdue Rate ($)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={settings?.fineRatePerDay ?? 2.0}
                onChange={(e) => handleChange('fineRatePerDay', parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Rate charged per day</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum Fine Cap per Book ($)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.maxFinePerBook ?? 50.0}
                onChange={(e) => handleChange('maxFinePerBook', parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Upper limit per overdue book</p>
            </div>
          </div>
        </div>

        {/* Hold Reservations & Institution Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
            Hold Policies & Institution Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hold Pickup Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={settings?.holdExpirationHours ?? 48}
                onChange={(e) => handleChange('holdExpirationHours', parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hours a reserved book is held before passing to next patron</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Library Name
              </label>
              <input
                type="text"
                value={settings?.libraryName || ''}
                onChange={(e) => handleChange('libraryName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Library Policies'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
