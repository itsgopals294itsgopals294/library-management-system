import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    authors: {
      type: [String],
      required: [true, 'At least one author is required'],
      index: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      index: true,
    },
    publisher: {
      type: String,
      trim: true,
      default: 'Unknown Publisher',
    },
    publishedYear: {
      type: Number,
    },
    edition: {
      type: String,
      default: '1st Edition',
    },
    language: {
      type: String,
      default: 'English',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
      enum: ['Hardcover', 'Paperback', 'E-Book', 'Audiobook', 'Journal', 'Thesis'],
      default: 'Paperback',
    },
    digitalResource: {
      hasDigitalCopy: { type: Boolean, default: false },
      pdfUrl: { type: String, default: '' },
      previewSnippet: { type: String, default: '' },
      isPublicDomain: { type: Boolean, default: false },
    },
    deweyDecimal: {
      type: String,
      default: '',
    },
    callNumber: {
      type: String,
      default: '',
    },
    totalCopies: {
      type: Number,
      default: 0,
    },
    availableCopies: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound text index for powerful fuzzy / full text search
bookSchema.index({
  title: 'text',
  subtitle: 'text',
  authors: 'text',
  isbn: 'text',
  category: 'text',
  description: 'text',
  tags: 'text',
});

export default mongoose.model('Book', bookSchema);
