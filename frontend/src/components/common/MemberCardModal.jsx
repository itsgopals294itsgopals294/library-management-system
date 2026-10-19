import React from 'react';
import { X, Printer, BookOpen, ShieldCheck } from 'lucide-react';
import Barcode from './Barcode.jsx';

export const MemberCardModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 no-print">
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Official Digital Library Card
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 shadow-xl overflow-hidden border border-indigo-700/50">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                      <BookOpen className="w-4 h-4 text-indigo-200" />
                    </div>
                    <span className="font-bold tracking-wider text-sm uppercase text-indigo-100">Athena Library</span>
                  </div>
                  <p className="text-[10px] text-indigo-300 mt-0.5">INSTITUTE PATRON PASS</p>
                </div>
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium border border-white/20 capitalize">
                  {member.patronType || member.role}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-indigo-400/40 overflow-hidden flex-shrink-0">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white leading-tight">{member.name}</h4>
                  <p className="text-xs text-indigo-200 font-mono mt-0.5">{member.membershipId}</p>
                  <p className="text-[11px] text-indigo-300/80 truncate max-w-[200px]">{member.email}</p>
                </div>
              </div>

              {/* Barcode section on white badge for scanner contrast */}
              <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center shadow-inner">
                <Barcode
                  value={member.membershipId}
                  height={34}
                  width={1.5}
                  fontSize={11}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-indigo-200/70 pt-1 border-t border-indigo-700/50">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Library Patron
                </span>
                <span>Max Allowed: {member.maxBooksAllowed || 4} books</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCardModal;
