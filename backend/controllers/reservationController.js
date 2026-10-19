import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import BookCopy from '../models/BookCopy.js';
import { logAudit } from '../middleware/audit.js';

export const createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const memberId = req.user.role === 'member' ? req.user._id : req.body.memberId || req.user._id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if member already has an active reservation for this book
    const existing = await Reservation.findOne({
      book: bookId,
      member: memberId,
      status: { $in: ['waiting', 'ready_for_pickup'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active hold placed for this book.',
      });
    }

    // Calculate queue position
    const currentQueueCount = await Reservation.countDocuments({
      book: bookId,
      status: 'waiting',
    });

    const reservation = await Reservation.create({
      book: bookId,
      member: memberId,
      queuePosition: currentQueueCount + 1,
      status: 'waiting',
    });

    await logAudit({
      req,
      action: 'HOLD_PLACED',
      targetType: 'Reservation',
      targetId: reservation._id,
      details: { bookTitle: book.title, queuePosition: reservation.queuePosition },
    });

    res.status(201).json({
      success: true,
      message: `Hold placed for "${book.title}". You are #${reservation.queuePosition} in queue.`,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id).populate('book');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Only the reserving member or staff can cancel
    if (req.user.role === 'member' && reservation.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this hold.' });
    }

    // If an allocated copy was held, revert copy status to Available
    if (reservation.allocatedCopy) {
      await BookCopy.findByIdAndUpdate(reservation.allocatedCopy, { status: 'Available' });
      await Book.findByIdAndUpdate(reservation.book._id, { $inc: { availableCopies: 1 } });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    await logAudit({
      req,
      action: 'HOLD_CANCELLED',
      targetType: 'Reservation',
      targetId: reservation._id,
      details: { bookTitle: reservation.book.title },
    });

    res.json({ success: true, message: 'Reservation cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req, res, next) => {
  try {
    const { status, bookId, memberId } = req.query;
    const query = {};

    if (req.user.role === 'member') {
      query.member = req.user._id;
    } else if (memberId) {
      query.member = memberId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (bookId) {
      query.book = bookId;
    }

    const reservations = await Reservation.find(query)
      .populate('book', 'title isbn coverImage authors availableCopies')
      .populate('member', 'name email membershipId phone')
      .populate('allocatedCopy', 'barcode location copyNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    next(error);
  }
};
