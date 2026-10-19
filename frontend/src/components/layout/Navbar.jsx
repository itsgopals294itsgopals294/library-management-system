import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, BookOpen, Shield, User, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, switchDemoAccount } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & branding title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">Athena</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                  LMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Central Library & Research System</p>
            </div>
          </Link>
        </div>

        {/* Center: Fast Demo Switcher Bar */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
          <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Switch Demo Role:
          </span>
          <button
            onClick={() => switchDemoAccount('admin')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              user?.role === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchDemoAccount('librarian')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              user?.role === 'librarian' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Librarian
          </button>
          <button
            onClick={() => switchDemoAccount('student')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              user?.role === 'member' && user?.patronType === 'student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => switchDemoAccount('faculty')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              user?.role === 'member' && user?.patronType === 'faculty'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Faculty
          </button>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold uppercase text-indigo-600 capitalize">
                      {user.role} ({user.patronType || 'staff'})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">• {user.membershipId}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
