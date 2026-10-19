import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    queuePosition: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['waiting', 'ready_for_pickup', 'fulfilled', 'cancelled', 'expired'],
      default: 'waiting',
      index: true,
    },
    allocatedCopy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCopy',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    notifiedAt: {
      type: Date,
    },
    pickupExpiryDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);
