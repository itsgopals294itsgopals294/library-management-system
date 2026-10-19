import mongoose from 'mongoose';

const bookCopySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    copyNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Issued', 'Reserved', 'Under Maintenance', 'Damaged', 'Lost'],
      default: 'Available',
      index: true,
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Worn', 'Damaged'],
      default: 'Good',
    },
    location: {
      building: { type: String, default: 'Main Campus' },
      floor: { type: String, default: 'Floor 1' },
      aisle: { type: String, default: 'A-1' },
      shelf: { type: String, default: 'S-04' },
      callNumber: { type: String, default: '' },
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      default: 25.00,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('BookCopy', bookCopySchema);
