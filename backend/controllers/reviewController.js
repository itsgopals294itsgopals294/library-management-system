import Review from '../models/Review.js';
import Book from '../models/Book.js';

export const addReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if user already reviewed this book
    let review = await Review.findOne({ book: bookId, member: req.user._id });
    if (review) {
      review.rating = rating;
      review.comment = comment.trim();
      await review.save();
    } else {
      review = await Review.create({
        book: bookId,
        member: req.user._id,
        rating,
        comment: comment.trim(),
      });
    }

    // Recalculate book rating
    const stats = await Review.aggregate([
      { $match: { book: book._id, isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      book.rating = {
        average: parseFloat(stats[0].avgRating.toFixed(1)),
        count: stats[0].count,
      };
      await book.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
      bookRating: book.rating,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId, isApproved: true })
      .populate('member', 'name avatar membershipId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};
