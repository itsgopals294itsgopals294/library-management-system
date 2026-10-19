import Fine from '../models/Fine.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/audit.js';

export const getFines = async (req, res, next) => {
  try {
    const { status, memberId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'member') {
      query.member = req.user._id;
    } else if (memberId) {
      query.member = memberId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Fine.countDocuments(query);
    const fines = await Fine.find(query)
      .populate('member', 'name email membershipId phone')
      .populate({
        path: 'circulation',
        populate: [{ path: 'book', select: 'title isbn' }, { path: 'copy', select: 'barcode' }],
      })
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Summary calculations
    const summary = await Fine.aggregate([
      ...(req.user.role === 'member' ? [{ $match: { member: req.user._id } }] : []),
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      fines,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const payFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'cash' } = req.body;

    const fine = await Fine.findById(id).populate('member');
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Fine is already paid.' });
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    fine.status = 'paid';
    fine.paymentMethod = paymentMethod;
    fine.paymentDate = new Date();
    fine.collectedBy = req.user._id;
    fine.receiptNumber = receiptNumber;
    await fine.save();

    await logAudit({
      req,
      action: 'FINE_PAID',
      targetType: 'Fine',
      targetId: fine.fineId,
      details: {
        receiptNumber,
        amount: fine.amount,
        member: fine.member.name,
        paymentMethod,
      },
    });

    res.json({
      success: true,
      message: `Payment of $${fine.amount.toFixed(2)} recorded. Receipt #${receiptNumber}`,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

export const waiveFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Administrative waiver' } = req.body;

    const fine = await Fine.findById(id).populate('member');
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot waive an already paid fine.' });
    }

    fine.status = 'waived';
    fine.paymentMethod = 'waived_by_admin';
    fine.waiveReason = reason;
    fine.collectedBy = req.user._id;
    fine.paymentDate = new Date();
    await fine.save();

    await logAudit({
      req,
      action: 'FINE_WAIVED',
      targetType: 'Fine',
      targetId: fine.fineId,
      details: { amount: fine.amount, member: fine.member.name, reason },
    });

    res.json({
      success: true,
      message: `Fine of $${fine.amount.toFixed(2)} has been waived.`,
      fine,
    });
  } catch (error) {
    next(error);
  }
};
