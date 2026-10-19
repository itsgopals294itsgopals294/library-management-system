import Book from '../models/Book.js';
import BookCopy from '../models/BookCopy.js';
import Circulation from '../models/Circulation.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import AuditLog from '../models/AuditLog.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalTitles = await Book.countDocuments();
    const totalPhysicalCopies = await BookCopy.countDocuments();
    const availableCopies = await BookCopy.countDocuments({ status: 'Available' });
    const issuedCopies = await BookCopy.countDocuments({ status: 'Issued' });
    const maintenanceCopies = await BookCopy.countDocuments({ status: { $in: ['Under Maintenance', 'Damaged', 'Lost'] } });

    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', isActive: true });

    const activeLoans = await Circulation.countDocuments({ status: { $in: ['active', 'overdue'] } });
    const overdueLoans = await Circulation.countDocuments({
      status: { $in: ['active', 'overdue'] },
      dueDate: { $lt: new Date() },
    });

    // Fines metrics
    const fineStats = await Fine.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let finesCollected = 0;
    let finesPending = 0;
    fineStats.forEach((f) => {
      if (f._id === 'paid') finesCollected = f.totalAmount;
      if (f._id === 'unpaid') finesPending = f.totalAmount;
    });

    // Top 5 Categories
    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalCopies: { $sum: '$totalCopies' } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Most Borrowed Books
    const topBorrowed = await Circulation.aggregate([
      { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: '$bookDetails' },
      {
        $project: {
          title: '$bookDetails.title',
          authors: '$bookDetails.authors',
          coverImage: '$bookDetails.coverImage',
          category: '$bookDetails.category',
          borrowCount: 1,
        },
      },
    ]);

    // Monthly Circulation Trends (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const circulationTrends = await Circulation.aggregate([
      { $match: { issueDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' },
          },
          checkouts: { $sum: 1 },
          returns: {
            $sum: { $cond: [{ $ifNull: ['$returnDate', false] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = circulationTrends.map((t) => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      checkouts: t.checkouts,
      returns: t.returns,
    }));

    // Recent system audit activities
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      kpis: {
        totalTitles,
        totalPhysicalCopies,
        availableCopies,
        issuedCopies,
        maintenanceCopies,
        totalMembers,
        activeMembers,
        activeLoans,
        overdueLoans,
        finesCollected: parseFloat(finesCollected.toFixed(2)),
        finesPending: parseFloat(finesPending.toFixed(2)),
      },
      categoryStats,
      topBorrowed,
      circulationTrends: formattedTrends,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (targetType && targetType !== 'all') query.targetType = targetType;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      logs,
    });
  } catch (error) {
    next(error);
  }
};
