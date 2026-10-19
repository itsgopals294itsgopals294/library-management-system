import User from '../models/User.js';
import Circulation from '../models/Circulation.js';
import Fine from '../models/Fine.js';
import { logAudit } from '../middleware/audit.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, patronType, search, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (patronType && patronType !== 'all') {
      query.patronType = patronType;
    }

    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'true';
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { membershipId: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Enrich users with active loans and fines
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const activeLoansCount = await Circulation.countDocuments({
          member: u._id,
          status: { $in: ['active', 'overdue'] },
        });

        const unpaidFines = await Fine.aggregate([
          { $match: { member: u._id, status: 'unpaid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const fineDue = unpaidFines.length > 0 ? unpaidFines[0].total : 0;

        return {
          ...u.toObject(),
          activeLoansCount,
          fineDue,
        };
      })
    );

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const activeLoans = await Circulation.find({
      member: user._id,
      status: { $in: ['active', 'overdue'] },
    }).populate('book').populate('copy');

    const fines = await Fine.find({ member: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      activeLoans,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, patronType, maxBooksAllowed, maxBorrowDays, phone, address, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role && req.user.role === 'admin') user.role = role;
    if (patronType) user.patronType = patronType;
    if (maxBooksAllowed !== undefined) user.maxBooksAllowed = maxBooksAllowed;
    if (maxBorrowDays !== undefined) user.maxBorrowDays = maxBorrowDays;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAudit({
      req,
      action: 'USER_UPDATED',
      targetType: 'User',
      targetId: user._id,
      details: { name: user.name, role: user.role, isActive: user.isActive },
    });

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      req,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, isActive: user.isActive },
    });

    res.json({
      success: true,
      message: `User ${user.name} has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};
