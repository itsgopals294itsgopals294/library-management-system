import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { X, Printer, Barcode as BarcodeIcon, MapPin } from 'lucide-react';
import Barcode from '../components/common/Barcode.jsx';

export const BarcodeSheetModal = ({ isOpen, onClose, book }) => {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book?._id) {
      const fetchCopies = async () => {
        try {
          const res = await api.get(`/copies/book/${book._id}`);
          if (res.success) {
            setCopies(res.copies);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCopies();
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 no-print">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BarcodeIcon className="w-5 h-5 text-indigo-600" />
              Physical Spine Labels & Barcodes
            </h3>
            <p className="text-xs text-slate-400">Printable sticker labels for "{book.title}"</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Sticker Sheet
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Grid */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : copies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {copies.map((copy) => (
                <div
                  key={copy._id}
                  className="p-4 rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-between text-center space-y-2 shadow-xs"
                >
                  <div className="w-full border-b border-dashed border-slate-200 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      ATHENA LIBRARY
                    </p>
                    <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{book.title}</h5>
                  </div>

                  <Barcode value={copy.barcode} height={38} width={1.3} fontSize={10} />

                  <div className="w-full pt-1 border-t border-dashed border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Copy #{copy.copyNumber}</span>
                    <span>{copy.location?.callNumber || book.callNumber || 'STACKS'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-xs text-slate-400">No physical copies found for this title.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSheetModal;
