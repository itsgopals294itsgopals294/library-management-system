import Reservation from '../models/Reservation.js';
import BookCopy from '../models/BookCopy.js';
import Settings from '../models/Settings.js';

export const processHoldQueueOnReturn = async (bookId, returnedCopyId) => {
  try {
    const settings = (await Settings.findOne()) || { holdExpirationHours: 48 };

    // Find the next waiting reservation for this book, ordered by queuePosition or createdAt
    const nextReservation = await Reservation.findOne({
      book: bookId,
      status: 'waiting',
    }).sort({ queuePosition: 1, createdAt: 1 });

    if (!nextReservation) {
      // No active holds, copy stays Available
      await BookCopy.findByIdAndUpdate(returnedCopyId, { status: 'Available' });
      return null;
    }

    // Allocate copy to the next reservation
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + (settings.holdExpirationHours || 48));

    nextReservation.status = 'ready_for_pickup';
    nextReservation.allocatedCopy = returnedCopyId;
    nextReservation.notifiedAt = new Date();
    nextReservation.pickupExpiryDate = expiryDate;
    await nextReservation.save();

    // Mark copy as Reserved
    await BookCopy.findByIdAndUpdate(returnedCopyId, { status: 'Reserved' });

    console.log(`[Hold Queue] Copy ${returnedCopyId} allocated to Reservation ${nextReservation._id} (Member: ${nextReservation.member}) until ${expiryDate.toISOString()}`);
    return nextReservation;
  } catch (error) {
    console.error(`[Hold Queue Error] Failed to process hold queue: ${error.message}`);
    return null;
  }
};
