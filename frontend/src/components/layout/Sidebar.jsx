import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  BookOpen,
  Repeat,
  Boxes,
  BookmarkCheck,
  CreditCard,
  Users,
  History,
  Settings,
  BookMarked,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isStaff, isAdmin } = useAuth();

  const staffNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Circulation Desk', path: '/circulation', icon: Repeat },
    { name: 'Catalog & OPAC', path: '/catalog', icon: BookOpen },
    { name: 'Inventory & ISBN', path: '/inventory', icon: Boxes },
    { name: 'Hold Reservations', path: '/reservations', icon: BookmarkCheck },
    { name: 'Fines & Payments', path: '/fines', icon: CreditCard },
    { name: 'Member Directory', path: '/members', icon: Users },
  ];

  const adminNav = [
    { name: 'System Audit Logs', path: '/audit-logs', icon: ShieldAlert },
    { name: 'Library Settings', path: '/settings', icon: Settings },
  ];

  const memberNav = [
    { name: 'Catalog & OPAC', path: '/catalog', icon: BookOpen },
    { name: 'My Patron Portal', path: '/portal', icon: BookMarked },
    { name: 'My Holds & Queue', path: '/reservations', icon: BookmarkCheck },
    { name: 'My Fines & Dues', path: '/fines', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-61px)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isStaff ? 'Circulation & Management' : 'Library Explorer'}
            </p>
            <div className="space-y-1">
              {(isStaff ? staffNav : memberNav).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Administration
              </p>
              <div className="space-y-1">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patron shortcut if staff wants to test member view */}
          {isStaff && (
            <div className="pt-2 border-t border-slate-100">
              <NavLink
                to="/portal"
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100/70'
                  }`
                }
              >
                <BookMarked className="w-4 h-4 text-indigo-600" />
                <span>Patron Self-Service View</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Library Info Card at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700">Athena Central Library</span>
          </div>
          <p className="text-[10px] text-slate-400">Hours: Mon - Sat • 8 AM - 10 PM</p>
          <p className="text-[10px] text-slate-400">Desk Extension: #4402</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
