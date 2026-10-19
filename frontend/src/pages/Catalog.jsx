import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import {
  Search,
  Filter,
  Star,
  BookOpen,
  MapPin,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import BookDetailModal from './BookDetailModal.jsx';

export const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [format, setFormat] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const categories = [
    'All',
    'Computer Science',
    'Artificial Intelligence',
    'Data Science',
    'Physics & Quantum',
    'Mathematics',
    'Literature & Philosophy',
  ];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort,
      });

      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (format !== 'All') params.append('format', format);
      if (availableOnly) params.append('availableOnly', 'true');

      const res = await api.get(`/books?${params.toString()}`);
      if (res.success) {
        setBooks(res.books);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, format, availableOnly, sort, page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Online Public Access Catalog (OPAC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Library Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse through {total} cataloged works, physical shelf holdings, and digital resources.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, subject tag, or Dewey call number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newly Cataloged</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="rating">Top Rated</option>
              <option value="copies">Most Available Copies</option>
            </select>

            <button
              onClick={() => setAvailableOnly((prev) => !prev)}
              className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                availableOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Available Now Only
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Genre:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex-shrink-0 ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="w-full h-48 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const hasCopies = book.availableCopies > 0;
            return (
              <div
                key={book._id}
                onClick={() => setSelectedBookId(book._id)}
                className="group bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400/80 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Cover Container */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner mb-3">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Format badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                      {book.format}
                    </span>

                    {/* Star Rating */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{book.rating?.average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  {/* Title & Authors */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {book.authors?.join(', ') || 'Unknown Author'}
                    </p>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  {/* Shelf Call Number */}
                  {book.callNumber && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{book.callNumber}</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        hasCopies
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hasCopies ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {book.availableCopies} of {book.totalCopies} Available
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Checked Out (Hold Queue)
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-bold text-indigo-600 group-hover:underline">
                      Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No books found matching your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, changing the genre filter, or clearing the availability toggle.
          </p>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onRefresh={fetchBooks}
        />
      )}
    </div>
  );
};

export default Catalog;
