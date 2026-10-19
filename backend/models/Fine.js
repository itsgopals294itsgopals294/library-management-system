import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema(
  {
    fineId: {
      type: String,
      unique: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    circulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circulation',
    },
    type: {
      type: String,
      enum: ['overdue', 'lost_book', 'damaged_book', 'membership_fee', 'other'],
      default: 'overdue',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    daysOverdue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'waived'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'waived_by_admin', 'pending'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptNumber: {
      type: String,
    },
    waiveReason: {
      type: String,
    },
  },
  { timestamps: true }
);

fineSchema.pre('save', function (next) {
  if (!this.fineId) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.fineId = `FINE-${new Date().getFullYear()}-${rand}`;
  }
  next();
});

export default mongoose.model('Fine', fineSchema);
