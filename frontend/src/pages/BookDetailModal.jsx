import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  X,
  Star,
  BookOpen,
  MapPin,
  BookmarkCheck,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  Send,
  AlertCircle,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Barcode from '../components/common/Barcode.jsx';

export const BookDetailModal = ({ bookId, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, copies, digital, reviews
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reserving, setReserving] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/books/${bookId}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) fetchDetails();
  }, [bookId]);

  const handlePlaceHold = async () => {
    if (!user) {
      toast.error('Please sign in to place a hold on this book');
      return;
    }
    setReserving(true);
    try {
      const res = await api.post('/reservations', { bookId });
      if (res.success) {
        toast.success(res.message);
        fetchDetails();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReserving(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to write a review');
      return;
    }
    if (!userComment.trim()) {
      toast.error('Please provide review comments');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/book/${bookId}`, {
        rating: userRating,
        comment: userComment,
      });
      if (res.success) {
        toast.success('Your review and rating have been posted!');
        setUserComment('');
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!bookId) return null;

  const book = data?.book;
  const copies = data?.copies || [];
  const reviews = data?.reviews || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600">
              {book?.category || 'Book Record'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ISBN: {book?.isbn}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : book ? (
          <div className="flex-1 overflow-y-auto">
            {/* Top Overview Section */}
            <div className="p-6 sm:p-8 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row gap-6">
              {/* Book Cover */}
              <div className="w-full sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-md flex-shrink-0">
                <img
                  src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Header Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{book.title}</h2>
                  {book.subtitle && <p className="text-sm text-slate-500 mt-0.5">{book.subtitle}</p>}
                </div>

                <p className="text-sm font-medium text-slate-700">
                  By <span className="font-bold text-slate-900">{book.authors?.join(', ')}</span>
                </p>

                {/* Star rating & Meta badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-amber-600 font-normal">({book.rating?.count || 0} reviews)</span>
                  </div>

                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    {book.format} • {book.publishedYear || 'N/A'}
                  </span>

                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    {book.pageCount} pages
                  </span>

                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    {book.publisher}
                  </span>
                </div>

                {/* Shelf locator info pill */}
                {book.callNumber && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-800">Physical Shelf Call Number: </span>
                        <span className="font-mono font-semibold text-indigo-600">{book.callNumber}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px]">Dewey: {book.deweyDecimal || 'General'}</span>
                  </div>
                )}

                {/* Actions: Hold reservation & Availability */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                      book.availableCopies > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {book.availableCopies} of {book.totalCopies} Copies Currently Available
                  </div>

                  <button
                    onClick={handlePlaceHold}
                    disabled={reserving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    {reserving ? 'Placing Hold...' : 'Place Hold / Reserve'}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white sticky top-0 z-10">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Synopsis & Metadata
              </button>
              <button
                onClick={() => setActiveTab('copies')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'copies'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Physical Copies ({copies.length})
              </button>
              {book.digitalResource?.hasDigitalCopy && (
                <button
                  onClick={() => setActiveTab('digital')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'digital'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Digital Resource & Preview
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Patron Reviews ({reviews.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {book.description || 'No detailed synopsis provided for this record.'}
                    </p>
                  </div>

                  {book.tags && book.tags.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subject Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {book.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'copies' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Each physical asset is uniquely tracked by barcode and specific shelf coordinates in the stacks.
                  </p>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Copy #</th>
                          <th className="py-3 px-4">Item Barcode</th>
                          <th className="py-3 px-4">Location / Shelf</th>
                          <th className="py-3 px-4">Condition</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {copies.map((c) => (
                          <tr key={c._id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-900">#{c.copyNumber}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                {c.barcode}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {c.location?.building} • {c.location?.floor} • Aisle {c.location?.aisle} • Shelf {c.location?.shelf}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-700 capitalize">{c.condition}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  c.status === 'Available'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : c.status === 'Issued'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : c.status === 'Reserved'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'digital' && book.digitalResource?.hasDigitalCopy && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Digital Resource Available</h4>
                      <p className="text-xs text-indigo-700 mt-0.5">Online preview snippet and e-resource access</p>
                    </div>
                    {book.digitalResource.pdfUrl && (
                      <a
                        href={book.digitalResource.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        Read Digital Copy →
                      </a>
                    )}
                  </div>

                  {book.digitalResource.previewSnippet && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                      {book.digitalResource.previewSnippet}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review submission form */}
                  <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Write a Review & Rate</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= userRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Share your thoughts on this book for other library members..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </div>
                  </form>

                  {/* List of reviews */}
                  <div className="space-y-3">
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div key={r._id} className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                <img
                                  src={r.member?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                  alt={r.member?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-800">{r.member?.name || 'Verified Patron'}</span>
                                <p className="text-[10px] text-slate-400 font-mono">{r.member?.membershipId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(r.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first to review this work!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookDetailModal;
