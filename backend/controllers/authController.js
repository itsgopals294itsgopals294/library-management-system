import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Circulation from '../models/Circulation.js';
import Fine from '../models/Fine.js';
import { logAudit } from '../middleware/audit.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'athena_lms_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, patronType, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only existing admin can create admin or librarian roles, otherwise default to member
    let assignedRole = 'member';
    if (role && ['admin', 'librarian'].includes(role)) {
      if (req.user && req.user.role === 'admin') {
        assignedRole = role;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      patronType: patronType || 'student',
      phone,
      address,
    });

    const token = generateToken(user._id);

    await logAudit({
      req,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role, membershipId: user.membershipId },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patronType: user.patronType,
        membershipId: user.membershipId,
        maxBooksAllowed: user.maxBooksAllowed,
        maxBorrowDays: user.maxBorrowDays,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact library admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    await logAudit({
      req,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id,
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      details: { email: user.email },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patronType: user.patronType,
        membershipId: user.membershipId,
        maxBooksAllowed: user.maxBooksAllowed,
        maxBorrowDays: user.maxBorrowDays,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const activeLoansCount = await Circulation.countDocuments({ member: user._id, status: { $in: ['active', 'overdue'] } });
    
    // Total unpaid fines
    const unpaidFines = await Fine.aggregate([
      { $match: { member: user._id, status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const fineDue = unpaidFines.length > 0 ? unpaidFines[0].total : 0;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patronType: user.patronType,
        membershipId: user.membershipId,
        maxBooksAllowed: user.maxBooksAllowed,
        maxBorrowDays: user.maxBorrowDays,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      stats: {
        activeLoansCount,
        fineDue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patronType: user.patronType,
        membershipId: user.membershipId,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
