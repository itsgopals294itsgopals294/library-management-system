import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import {
  Boxes,
  PlusCircle,
  Search,
  Barcode as BarcodeIcon,
  Trash2,
  Plus,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddBookModal from './AddBookModal.jsx';
import BarcodeSheetModal from './BarcodeSheetModal.jsx';

export const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [barcodeBook, setBarcodeBook] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/books?${params.toString()}`);
      if (res.success) {
        setBooks(res.books);
      }
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fast add copy to an existing book
  const handleAddCopy = async (bookId, bookTitle) => {
    try {
      const res = await api.post(`/copies/book/${bookId}`, {
        condition: 'Good',
        price: 25,
      });
      if (res.success) {
        toast.success(res.message);
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete book with guard
  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}" and all its physical copies?`)) {
      return;
    }
    try {
      const res = await api.delete(`/books/${bookId}`);
      if (res.success) {
        toast.success(res.message);
        fetchInventory();
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
            <Boxes className="w-3.5 h-3.5" />
            Collection Holdings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Asset Cataloging
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage bibliographic entries, physical copy assets, shelf coordinates, and spine label barcodes.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Catalog New Book (via ISBN)
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Showing {books.length} titles
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Title & Authors</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Physical Holdings</th>
                  <th className="py-3.5 px-4">Call Number</th>
                  <th className="py-3.5 px-4 text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'}
                          alt={b.title}
                          className="w-9 h-12 object-cover rounded-lg border border-slate-200 shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 truncate">{b.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{b.authors?.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{b.isbn}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {b.availableCopies} / {b.totalCopies}
                        </span>
                        <span className="text-[10px] text-slate-400">available</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.callNumber || b.deweyDecimal || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAddCopy(b._id, b.title)}
                          title="Add an extra physical copy"
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Copy
                        </button>

                        <button
                          onClick={() => setBarcodeBook(b)}
                          title="View & Print Spine Barcodes"
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <BarcodeIcon className="w-3.5 h-3.5" />
                          Barcodes
                        </button>

                        <button
                          onClick={() => handleDeleteBook(b._id, b.title)}
                          title="Delete book and physical copies"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No books found. Click "Catalog New Book" to auto-fetch via ISBN.
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBookModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchInventory}
      />

      <BarcodeSheetModal
        isOpen={!!barcodeBook}
        onClose={() => setBarcodeBook(null)}
        book={barcodeBook}
      />
    </div>
  );
};

export default Inventory;
