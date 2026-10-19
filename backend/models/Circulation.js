import mongoose from 'mongoose';

const circulationSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    copy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCopy',
      required: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    returnDate: {
      type: Date,
    },
    renewCount: {
      type: Number,
      default: 0,
    },
    maxRenewals: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue', 'lost'],
      default: 'active',
      index: true,
    },
    initialCondition: {
      type: String,
      default: 'Good',
    },
    returnCondition: {
      type: String,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

circulationSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.transactionId = `TXN-${new Date().getFullYear()}-${rand}`;
  }
  next();
});

export default mongoose.model('Circulation', circulationSchema);
