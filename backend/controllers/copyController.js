import BookCopy from '../models/BookCopy.js';
import Book from '../models/Book.js';
import Circulation from '../models/Circulation.js';
import { logAudit } from '../middleware/audit.js';

export const getCopiesByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const copies = await BookCopy.find({ book: bookId })
      .populate('book', 'title isbn authors callNumber coverImage')
      .sort({ copyNumber: 1 });

    res.json({ success: true, count: copies.length, copies });
  } catch (error) {
    next(error);
  }
};

export const getCopyByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const copy = await BookCopy.findOne({ barcode: barcode.trim() }).populate('book');

    if (!copy) {
      return res.status(404).json({ success: false, message: `No copy found with barcode "${barcode}"` });
    }

    // Check if copy is currently issued
    let activeLoan = null;
    if (copy.status === 'Issued') {
      activeLoan = await Circulation.findOne({ copy: copy._id, status: { $in: ['active', 'overdue'] } })
        .populate('member', 'name email membershipId phone patronType')
        .populate('issuedBy', 'name');
    }

    res.json({
      success: true,
      copy,
      activeLoan,
    });
  } catch (error) {
    next(error);
  }
};

export const addCopy = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { condition = 'Good', location, price = 25, notes = '', customBarcode } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const currentCount = await BookCopy.countDocuments({ book: bookId });
    const nextCopyNumber = currentCount + 1;

    let barcode = customBarcode?.trim();
    if (!barcode) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      barcode = `BC-${book.isbn.slice(-4)}-${nextCopyNumber}-${rand}`;
    }

    const existingBarcode = await BookCopy.findOne({ barcode });
    if (existingBarcode) {
      return res.status(400).json({ success: false, message: `Barcode "${barcode}" is already assigned to another item.` });
    }

    const copy = await BookCopy.create({
      book: bookId,
      barcode,
      copyNumber: nextCopyNumber,
      status: 'Available',
      condition,
      location: location || { building: 'Main Campus', floor: 'Floor 1', aisle: 'A-1', shelf: 'S-01', callNumber: book.callNumber || book.deweyDecimal },
      price,
      notes,
    });

    // Update book copies count
    book.totalCopies += 1;
    book.availableCopies += 1;
    await book.save();

    await logAudit({
      req,
      action: 'COPY_ADDED',
      targetType: 'BookCopy',
      targetId: copy._id,
      details: { bookTitle: book.title, barcode: copy.barcode, copyNumber: copy.copyNumber },
    });

    res.status(201).json({
      success: true,
      message: `Physical copy #${copy.copyNumber} with barcode ${copy.barcode} registered.`,
      copy,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCopy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { condition, status, location, notes, price } = req.body;

    const copy = await BookCopy.findById(id).populate('book');
    if (!copy) {
      return res.status(404).json({ success: false, message: 'Copy not found' });
    }

    const oldStatus = copy.status;

    if (condition) copy.condition = condition;
    if (location) copy.location = { ...copy.location, ...location };
    if (notes !== undefined) copy.notes = notes;
    if (price !== undefined) copy.price = price;

    if (status && status !== oldStatus) {
      // If setting to/from Available, adjust book availableCopies
      if (oldStatus === 'Available' && status !== 'Available') {
        await Book.findByIdAndUpdate(copy.book._id, { $inc: { availableCopies: -1 } });
      } else if (oldStatus !== 'Available' && status === 'Available') {
        await Book.findByIdAndUpdate(copy.book._id, { $inc: { availableCopies: 1 } });
      }
      copy.status = status;
    }

    await copy.save();

    await logAudit({
      req,
      action: 'COPY_UPDATED',
      targetType: 'BookCopy',
      targetId: copy._id,
      details: { barcode: copy.barcode, status: copy.status, condition: copy.condition },
    });

    res.json({
      success: true,
      message: 'Physical copy updated successfully',
      copy,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCopy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const copy = await BookCopy.findById(id).populate('book');
    if (!copy) {
      return res.status(404).json({ success: false, message: 'Copy not found' });
    }

    if (copy.status === 'Issued') {
      return res.status(400).json({ success: false, message: 'Cannot delete copy while currently issued to a member.' });
    }

    const wasAvailable = copy.status === 'Available';
    const bookId = copy.book._id;

    await copy.deleteOne();

    await Book.findByIdAndUpdate(bookId, {
      $inc: {
        totalCopies: -1,
        availableCopies: wasAvailable ? -1 : 0,
      },
    });

    await logAudit({
      req,
      action: 'COPY_DELETED',
      targetType: 'BookCopy',
      targetId: id,
      details: { barcode: copy.barcode, copyNumber: copy.copyNumber },
    });

    res.json({ success: true, message: `Copy ${copy.barcode} removed from inventory.` });
  } catch (error) {
    next(error);
  }
};
