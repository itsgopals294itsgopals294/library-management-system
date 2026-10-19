import Book from '../models/Book.js';
import BookCopy from '../models/BookCopy.js';
import Circulation from '../models/Circulation.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import { lookupIsbn } from '../services/isbnService.js';
import { logAudit } from '../middleware/audit.js';

export const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      format,
      availableOnly,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { subtitle: { $regex: term, $options: 'i' } },
        { authors: { $elemMatch: { $regex: term, $options: 'i' } } },
        { isbn: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
        { callNumber: { $regex: term, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (format && format !== 'All') {
      query.format = format;
    }

    if (availableOnly === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'title_asc') sortOption = { title: 1 };
    if (sort === 'title_desc') sortOption = { title: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1, 'rating.count': -1 };
    if (sort === 'year_desc') sortOption = { publishedYear: -1 };
    if (sort === 'copies') sortOption = { availableCopies: -1 };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      books,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Fetch copies
    const copies = await BookCopy.find({ book: book._id }).sort({ copyNumber: 1 });
    
    // Fetch reservations count
    const reservationsCount = await Reservation.countDocuments({
      book: book._id,
      status: { $in: ['waiting', 'ready_for_pickup'] },
    });

    // Fetch reviews
    const reviews = await Review.find({ book: book._id, isApproved: true })
      .populate('member', 'name avatar membershipId')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      book,
      copies,
      reservationsCount,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      authors,
      isbn,
      publisher,
      publishedYear,
      edition,
      language,
      category,
      tags,
      description,
      coverImage,
      pageCount,
      format,
      deweyDecimal,
      callNumber,
      initialCopies = 1,
      defaultLocation = { building: 'Main Campus', floor: 'Floor 1', aisle: 'A-1', shelf: 'S-01' },
      copyPrice = 25,
      digitalResource,
      featured = false,
    } = req.body;

    const existing = await Book.findOne({ isbn });
    if (existing) {
      return res.status(400).json({ success: false, message: `Book with ISBN ${isbn} already exists.` });
    }

    const cleanAuthors = Array.isArray(authors)
      ? authors
      : typeof authors === 'string'
      ? authors.split(',').map((a) => a.trim())
      : ['Unknown Author'];

    const cleanTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim())
      : [];

    const numCopies = Math.max(1, parseInt(initialCopies, 10) || 1);

    const book = await Book.create({
      title,
      subtitle,
      authors: cleanAuthors,
      isbn: isbn.trim(),
      publisher,
      publishedYear: publishedYear ? parseInt(publishedYear, 10) : undefined,
      edition,
      language: language || 'English',
      category: category || 'General',
      tags: cleanTags,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
      pageCount: pageCount ? parseInt(pageCount, 10) : 0,
      format: format || 'Paperback',
      deweyDecimal,
      callNumber,
      totalCopies: numCopies,
      availableCopies: numCopies,
      digitalResource: digitalResource || { hasDigitalCopy: false },
      featured: Boolean(featured),
    });

    // Auto-create physical copies with unique barcodes
    const createdCopies = [];
    for (let i = 1; i <= numCopies; i++) {
      const barcodeRand = Math.floor(100000 + Math.random() * 900000);
      const barcode = `BC-${book.isbn.slice(-4)}-${i}-${barcodeRand}`;

      const copy = await BookCopy.create({
        book: book._id,
        barcode,
        copyNumber: i,
        status: 'Available',
        condition: 'New',
        location: {
          ...defaultLocation,
          callNumber: callNumber || deweyDecimal || '',
        },
        price: copyPrice,
      });
      createdCopies.push(copy);
    }

    await logAudit({
      req,
      action: 'BOOK_CREATED',
      targetType: 'Book',
      targetId: book._id,
      details: { title: book.title, isbn: book.isbn, copiesAdded: numCopies },
    });

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" cataloged with ${numCopies} physical copies.`,
      book,
      copies: createdCopies,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { authors, tags } = req.body;
    const updates = { ...req.body };

    if (authors) {
      updates.authors = Array.isArray(authors)
        ? authors
        : typeof authors === 'string'
        ? authors.split(',').map((a) => a.trim())
        : book.authors;
    }

    if (tags) {
      updates.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim())
        : book.tags;
    }

    book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      req,
      action: 'BOOK_UPDATED',
      targetType: 'Book',
      targetId: book._id,
      details: { title: book.title, isbn: book.isbn },
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Safety check: ensure no active circulations exist
    const activeCirculations = await Circulation.countDocuments({
      book: book._id,
      status: { $in: ['active', 'overdue'] },
    });

    if (activeCirculations > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book. There are ${activeCirculations} active loans currently checked out.`,
      });
    }

    // Delete copies and book
    await BookCopy.deleteMany({ book: book._id });
    await Reservation.deleteMany({ book: book._id });
    await Review.deleteMany({ book: book._id });
    await book.deleteOne();

    await logAudit({
      req,
      action: 'BOOK_DELETED',
      targetType: 'Book',
      targetId: req.params.id,
      details: { title: book.title, isbn: book.isbn },
    });

    res.json({
      success: true,
      message: 'Book and associated physical copies deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const lookupIsbnController = async (req, res, next) => {
  try {
    const { isbn } = req.params;
    const metadata = await lookupIsbn(isbn);
    res.json({ success: true, metadata });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getFeaturedBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      $or: [{ featured: true }, { 'rating.average': { $gte: 4.5 } }],
    })
      .limit(8)
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};
