import Circulation from '../models/Circulation.js';
import BookCopy from '../models/BookCopy.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import Reservation from '../models/Reservation.js';
import Settings from '../models/Settings.js';
import { calculateOverdueFine } from '../services/fineService.js';
import { processHoldQueueOnReturn } from '../services/holdQueueService.js';
import { logAudit } from '../middleware/audit.js';

export const issueBook = async (req, res, next) => {
  try {
    const { memberIdentifier, copyBarcode, remarks = '', customDays } = req.body;

    if (!memberIdentifier || !copyBarcode) {
      return res.status(400).json({ success: false, message: 'Member identifier and copy barcode are required.' });
    }

    // 1. Resolve Member by ID, membershipId, or email
    const member = await User.findOne({
      $or: [
        { membershipId: memberIdentifier.trim() },
        { email: memberIdentifier.trim().toLowerCase() },
        ...(memberIdentifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: memberIdentifier }] : []),
      ],
    });

    if (!member) {
      return res.status(404).json({ success: false, message: `Member "${memberIdentifier}" not found.` });
    }

    if (!member.isActive) {
      return res.status(403).json({ success: false, message: 'Member account is currently deactivated.' });
    }

    // Check active loans quota
    const activeLoansCount = await Circulation.countDocuments({
      member: member._id,
      status: { $in: ['active', 'overdue'] },
    });

    const maxAllowed = member.maxBooksAllowed || 4;
    if (activeLoansCount >= maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Borrowing quota reached. Member already has ${activeLoansCount} of ${maxAllowed} allowed items issued.`,
      });
    }

    // Check for excessive overdue unpaid fines ($20+ limit)
    const unpaidFines = await Fine.aggregate([
      { $match: { member: member._id, status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const fineDue = unpaidFines.length > 0 ? unpaidFines[0].total : 0;
    if (fineDue > 20) {
      return res.status(400).json({
        success: false,
        message: `Member has outstanding overdue fines of $${fineDue.toFixed(2)}. Unpaid fines must be cleared or under $20 before new checkouts.`,
      });
    }

    // 2. Resolve Physical Copy by Barcode
    const copy = await BookCopy.findOne({ barcode: copyBarcode.trim() }).populate('book');
    if (!copy) {
      return res.status(404).json({ success: false, message: `No copy found with barcode "${copyBarcode}".` });
    }

    if (copy.status === 'Issued') {
      return res.status(400).json({ success: false, message: `Copy ${copy.barcode} is already checked out.` });
    }

    if (['Under Maintenance', 'Damaged', 'Lost'].includes(copy.status)) {
      return res.status(400).json({ success: false, message: `Copy is unavailable for loan (Status: ${copy.status}).` });
    }

    // If copy is marked Reserved, verify if it was reserved for THIS member
    if (copy.status === 'Reserved') {
      const activeReservation = await Reservation.findOne({
        allocatedCopy: copy._id,
        status: 'ready_for_pickup',
      });
      if (activeReservation && activeReservation.member.toString() !== member._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This copy is currently on hold / reserved for another patron.',
        });
      }
    }

    // 3. Compute Due Date
    const settings = (await Settings.findOne()) || { defaultLoanDaysStudent: 14, defaultLoanDaysFaculty: 30 };
    const loanDays = customDays
      ? parseInt(customDays, 10)
      : member.patronType === 'faculty'
      ? settings.defaultLoanDaysFaculty
      : member.maxBorrowDays || settings.defaultLoanDaysStudent;

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + loanDays);

    // 4. Create Circulation Record
    const circulation = await Circulation.create({
      book: copy.book._id,
      copy: copy._id,
      member: member._id,
      issuedBy: req.user._id,
      issueDate,
      dueDate,
      initialCondition: copy.condition,
      remarks,
    });

    // 5. Update Copy and Book
    copy.status = 'Issued';
    await copy.save();

    await Book.findByIdAndUpdate(copy.book._id, { $inc: { availableCopies: -1 } });

    // 6. If member had a reservation for this book, mark it fulfilled
    await Reservation.findOneAndUpdate(
      {
        book: copy.book._id,
        member: member._id,
        status: { $in: ['waiting', 'ready_for_pickup'] },
      },
      {
        status: 'fulfilled',
        allocatedCopy: copy._id,
      }
    );

    await logAudit({
      req,
      action: 'BOOK_CHECKOUT',
      targetType: 'Circulation',
      targetId: circulation.transactionId,
      details: {
        bookTitle: copy.book.title,
        copyBarcode: copy.barcode,
        member: member.name,
        membershipId: member.membershipId,
        dueDate: dueDate.toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      message: `"${copy.book.title}" (Copy #${copy.copyNumber}) issued to ${member.name}.`,
      circulation: {
        ...circulation.toObject(),
        book: copy.book,
        copy,
        member: {
          id: member._id,
          name: member.name,
          membershipId: member.membershipId,
          email: member.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const { copyBarcode, returnCondition, remarks, markAsLost } = req.body;

    if (!copyBarcode) {
      return res.status(400).json({ success: false, message: 'Copy barcode is required.' });
    }

    const copy = await BookCopy.findOne({ barcode: copyBarcode.trim() }).populate('book');
    if (!copy) {
      return res.status(404).json({ success: false, message: `Copy with barcode "${copyBarcode}" not found.` });
    }

    const circulation = await Circulation.findOne({
      copy: copy._id,
      status: { $in: ['active', 'overdue'] },
    }).populate('member').populate('book');

    if (!circulation) {
      return res.status(400).json({
        success: false,
        message: `Copy ${copy.barcode} is not currently recorded as checked out. Current copy status: ${copy.status}.`,
      });
    }

    const returnDate = new Date();
    circulation.returnDate = returnDate;
    circulation.returnedTo = req.user._id;
    circulation.returnCondition = returnCondition || copy.condition;
    circulation.remarks = remarks || circulation.remarks;

    let fineRecord = null;

    if (markAsLost) {
      circulation.status = 'lost';
      copy.status = 'Lost';
      const replacementCost = copy.price || 30.00;
      
      fineRecord = await Fine.create({
        member: circulation.member._id,
        circulation: circulation._id,
        type: 'lost_book',
        amount: replacementCost,
        status: 'unpaid',
      });
      circulation.fineAmount = replacementCost;
    } else {
      circulation.status = 'returned';

      // Check for overdue fine
      const fineResult = await calculateOverdueFine(circulation.dueDate, returnDate);

      if (fineResult.fineAmount > 0) {
        fineRecord = await Fine.create({
          member: circulation.member._id,
          circulation: circulation._id,
          type: 'overdue',
          amount: fineResult.fineAmount,
          daysOverdue: fineResult.daysOverdue,
          status: 'unpaid',
        });
        circulation.fineAmount = fineResult.fineAmount;
      }

      // Check condition update
      if (returnCondition && returnCondition !== copy.condition) {
        copy.condition = returnCondition;
        if (returnCondition === 'Damaged') {
          copy.status = 'Damaged';
          // Charge damage fee
          const damageFee = Math.round(copy.price * 0.5) || 15.0;
          await Fine.create({
            member: circulation.member._id,
            circulation: circulation._id,
            type: 'damaged_book',
            amount: damageFee,
            status: 'unpaid',
          });
        }
      }
    }

    await circulation.save();
    await copy.save();

    // If not lost or damaged, restore copy to Available or allocate to hold queue
    let nextHold = null;
    if (copy.status !== 'Lost' && copy.status !== 'Damaged') {
      nextHold = await processHoldQueueOnReturn(copy.book._id, copy._id);
      if (!nextHold) {
        copy.status = 'Available';
        await copy.save();
        await Book.findByIdAndUpdate(copy.book._id, { $inc: { availableCopies: 1 } });
      }
    }

    await logAudit({
      req,
      action: markAsLost ? 'BOOK_MARKED_LOST' : 'BOOK_RETURNED',
      targetType: 'Circulation',
      targetId: circulation.transactionId,
      details: {
        bookTitle: copy.book.title,
        copyBarcode: copy.barcode,
        member: circulation.member.name,
        fineAmount: circulation.fineAmount,
        holdQueued: !!nextHold,
      },
    });

    res.json({
      success: true,
      message: `"${copy.book.title}" returned successfully.${
        circulation.fineAmount > 0 ? ` Overdue fine of $${circulation.fineAmount.toFixed(2)} recorded.` : ''
      }${nextHold ? ' Book reserved for patron next in queue.' : ''}`,
      circulation,
      fine: fineRecord,
      holdPromoted: !!nextHold,
    });
  } catch (error) {
    next(error);
  }
};

export const renewBook = async (req, res, next) => {
  try {
    const { id } = req.params; // circulation id
    const circulation = await Circulation.findById(id).populate('book').populate('member');

    if (!circulation) {
      return res.status(404).json({ success: false, message: 'Loan transaction not found' });
    }

    if (circulation.status !== 'active') {
      return res.status(400).json({ success: false, message: `Cannot renew a loan with status: ${circulation.status}` });
    }

    // Check renew limit
    if (circulation.renewCount >= circulation.maxRenewals) {
      return res.status(400).json({
        success: false,
        message: `Renewal limit of ${circulation.maxRenewals} reached for this item.`,
      });
    }

    // Check if another member has reserved this book!
    const waitingReservation = await Reservation.findOne({
      book: circulation.book._id,
      status: 'waiting',
      member: { $ne: circulation.member._id },
    });

    if (waitingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew: another patron has placed a hold on this title.',
      });
    }

    // Extend due date by 14 days
    const currentDue = new Date(circulation.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);

    circulation.dueDate = currentDue;
    circulation.renewCount += 1;
    await circulation.save();

    await logAudit({
      req,
      action: 'BOOK_RENEWED',
      targetType: 'Circulation',
      targetId: circulation.transactionId,
      details: {
        bookTitle: circulation.book.title,
        newDueDate: currentDue.toISOString(),
        renewCount: circulation.renewCount,
      },
    });

    res.json({
      success: true,
      message: `Loan renewed. New due date is ${currentDue.toLocaleDateString()}.`,
      circulation,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveLoans = async (req, res, next) => {
  try {
    const { filter = 'all', search = '', page = 1, limit = 20 } = req.query;

    const query = { status: { $in: ['active', 'overdue'] } };
    const now = new Date();

    if (filter === 'overdue') {
      query.dueDate = { $lt: now };
    } else if (filter === 'due_today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const total = await Circulation.countDocuments(query);
    const loans = await Circulation.find(query)
      .populate('book', 'title isbn authors coverImage callNumber')
      .populate('copy', 'barcode copyNumber location condition')
      .populate('member', 'name email membershipId phone patronType')
      .populate('issuedBy', 'name')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Calculate live overdue status and pending fine for display
    const loansWithLiveFines = await Promise.all(
      loans.map(async (loan) => {
        const obj = loan.toObject();
        if (new Date(loan.dueDate) < new Date() && loan.status === 'active') {
          obj.isOverdue = true;
          const fineInfo = await calculateOverdueFine(loan.dueDate, new Date());
          obj.currentEstimatedFine = fineInfo.fineAmount;
          obj.daysOverdue = fineInfo.daysOverdue;
        } else {
          obj.isOverdue = false;
          obj.currentEstimatedFine = 0;
          obj.daysOverdue = 0;
        }
        return obj;
      })
    );

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      loans: loansWithLiveFines,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberLoans = async (req, res, next) => {
  try {
    const memberId = req.params.memberId || req.user._id;

    // Active loans
    const activeLoans = await Circulation.find({
      member: memberId,
      status: { $in: ['active', 'overdue'] },
    })
      .populate('book')
      .populate('copy')
      .sort({ dueDate: 1 });

    // History (returned or lost)
    const history = await Circulation.find({
      member: memberId,
      status: { $in: ['returned', 'lost'] },
    })
      .populate('book')
      .populate('copy')
      .sort({ returnDate: -1 })
      .limit(30);

    const enrichedActive = await Promise.all(
      activeLoans.map(async (loan) => {
        const obj = loan.toObject();
        if (new Date(loan.dueDate) < new Date()) {
          obj.isOverdue = true;
          const fineInfo = await calculateOverdueFine(loan.dueDate, new Date());
          obj.currentEstimatedFine = fineInfo.fineAmount;
          obj.daysOverdue = fineInfo.daysOverdue;
        } else {
          obj.isOverdue = false;
          obj.currentEstimatedFine = 0;
          obj.daysOverdue = 0;
        }
        return obj;
      })
    );

    res.json({
      success: true,
      activeLoans: enrichedActive,
      history,
    });
  } catch (error) {
    next(error);
  }
};
