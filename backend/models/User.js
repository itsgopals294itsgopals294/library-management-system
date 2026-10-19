import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    membershipId: {
      type: String,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'librarian', 'member'],
      default: 'member',
    },
    patronType: {
      type: String,
      enum: ['student', 'faculty', 'researcher', 'general'],
      default: 'student',
    },
    maxBooksAllowed: {
      type: Number,
      default: function () {
        if (this.role === 'admin' || this.role === 'librarian') return 20;
        if (this.patronType === 'faculty') return 10;
        if (this.patronType === 'researcher') return 8;
        return 4; // student & general
      },
    },
    maxBorrowDays: {
      type: Number,
      default: function () {
        if (this.patronType === 'faculty') return 30;
        if (this.patronType === 'researcher') return 21;
        return 14; // student & general
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate membershipId if not present
userSchema.pre('save', async function (next) {
  if (!this.membershipId) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const prefix = this.role === 'admin' ? 'ADM' : this.role === 'librarian' ? 'LIB' : 'MEM';
    this.membershipId = `${prefix}-${new Date().getFullYear()}-${randomSuffix}`;
  }

  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
