import React, { useState } from 'react';
import api from '../api/client.js';
import { X, Sparkles, BookOpen, Layers, CheckCircle, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddBookModal = ({ isOpen, onClose, onSuccess }) => {
  const [isbn, setIsbn] = useState('');
  const [fetchingIsbn, setFetchingIsbn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState('Computer Science');
  const [format, setFormat] = useState('Paperback');
  const [pageCount, setPageCount] = useState(300);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [deweyDecimal, setDeweyDecimal] = useState('004');
  const [callNumber, setCallNumber] = useState('QA76');

  // Copy distribution
  const [initialCopies, setInitialCopies] = useState(3);
  const [building, setBuilding] = useState('Main Campus');
  const [floor, setFloor] = useState('Floor 2');
  const [aisle, setAisle] = useState('A-1');
  const [shelf, setShelf] = useState('S-01');

  if (!isOpen) return null;

  const handleIsbnLookup = async () => {
    if (!isbn.trim()) {
      toast.error('Please enter an ISBN-10 or ISBN-13');
      return;
    }

    setFetchingIsbn(true);
    try {
      const res = await api.get(`/books/isbn/${isbn.trim()}`);
      if (res.success && res.metadata) {
        const m = res.metadata;
        setTitle(m.title || '');
        setSubtitle(m.subtitle || '');
        setAuthors(Array.isArray(m.authors) ? m.authors.join(', ') : m.authors || '');
        setPublisher(m.publisher || '');
        if (m.publishedYear) setPublishedYear(m.publishedYear);
        if (m.category) setCategory(m.category);
        if (m.pageCount) setPageCount(m.pageCount);
        if (m.description) setDescription(m.description);
        if (m.coverImage) setCoverImage(m.coverImage);
        if (m.tags) setTags(m.tags.join(', '));
        toast.success(`Metadata auto-fetched successfully from ${m.source}!`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFetchingIsbn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isbn.trim() || !title.trim() || !authors.trim()) {
      toast.error('ISBN, Title, and Authors are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/books', {
        isbn: isbn.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        authors: authors.split(',').map((a) => a.trim()),
        publisher: publisher.trim(),
        publishedYear: parseInt(publishedYear, 10),
        category,
        format,
        pageCount: parseInt(pageCount, 10) || 0,
        description: description.trim(),
        coverImage: coverImage.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        deweyDecimal: deweyDecimal.trim(),
        callNumber: callNumber.trim(),
        initialCopies: parseInt(initialCopies, 10) || 1,
        defaultLocation: {
          building,
          floor,
          aisle,
          shelf,
        },
      });

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Catalog New Book Work
            </h3>
            <p className="text-xs text-slate-400">Add bibliographic record with automatic physical copy creation</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ISBN Autofetcher Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100/60 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Instant ISBN Auto-Cataloger
                </span>
              </div>
              <span className="text-[11px] text-indigo-600">Google Books & Open Library Sync</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 10 or 13-digit ISBN (e.g. 9780132350884 or 9781449373320)"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleIsbnLookup}
                disabled={fetchingIsbn || !isbn.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                {fetchingIsbn ? 'Fetching...' : 'Auto-Fetch Metadata'}
              </button>
            </div>
          </div>

          {/* Book Core Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bibliographic Metadata</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Designing Data-Intensive Applications"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. The Big Ideas Behind Scalable Systems"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Authors (comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Martin Kleppmann, Robert C. Martin"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Publisher</label>
                <input
                  type="text"
                  placeholder="e.g. O'Reilly Media"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pub. Year</label>
                  <input
                    type="number"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Count</label>
                  <input
                    type="number"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Genre Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Physics & Quantum">Physics & Quantum</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Literature & Philosophy">Literature & Philosophy</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Paperback">Paperback</option>
                  <option value="Hardcover">Hardcover</option>
                  <option value="E-Book">E-Book</option>
                  <option value="Journal">Journal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Synopsis</label>
                <textarea
                  rows={3}
                  placeholder="Overview of the book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Physical Holdings & Shelf Placement */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Physical Holdings & Shelf Placement
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Copies</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={initialCopies}
                  onChange={(e) => setInitialCopies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Building</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Floor</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aisle</label>
                <input
                  type="text"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelf</label>
                <input
                  type="text"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Call Number</label>
                <input
                  type="text"
                  placeholder="e.g. QA76.9.D3 K54"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dewey Classification</label>
                <input
                  type="text"
                  placeholder="e.g. 005.74"
                  value={deweyDecimal}
                  onChange={(e) => setDeweyDecimal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Creating Book & Barcodes...' : `Save & Generate ${initialCopies} Copies`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
