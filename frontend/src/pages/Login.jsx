import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BookOpen, LogIn, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Athena Library System</h2>
          <p className="text-xs text-slate-500">Sign in to access circulation desk, OPAC, or patron services</p>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1-Click Demo Accounts:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@athena.edu', 'Admin@123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-semibold text-left transition hover:shadow-xs"
            >
              👑 <span className="font-bold">Admin</span>
              <p className="text-[10px] text-slate-400">admin@athena.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('librarian@athena.edu', 'Lib@123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-semibold text-left transition hover:shadow-xs"
            >
              📚 <span className="font-bold">Librarian</span>
              <p className="text-[10px] text-slate-400">librarian@athena.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student@athena.edu', 'Student@123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-semibold text-left transition hover:shadow-xs"
            >
              🎓 <span className="font-bold">Student</span>
              <p className="text-[10px] text-slate-400">student@athena.edu</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('faculty@athena.edu', 'Faculty@123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-semibold text-left transition hover:shadow-xs"
            >
              🏛️ <span className="font-bold">Faculty</span>
              <p className="text-[10px] text-slate-400">faculty@athena.edu</p>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          New member?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register Patron Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
