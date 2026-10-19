import Settings from '../models/Settings.js';

export const calculateOverdueFine = async (dueDate, returnDate = new Date()) => {
  const settings = (await Settings.findOne()) || {
    gracePeriodDays: 1,
    fineRatePerDay: 2.0,
    maxFinePerBook: 50.0,
  };

  const due = new Date(dueDate);
  const ret = new Date(returnDate);

  if (ret <= due) {
    return { daysOverdue: 0, fineAmount: 0 };
  }

  const diffTime = ret.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= settings.gracePeriodDays) {
    return { daysOverdue: diffDays, fineAmount: 0, graceApplied: true };
  }

  // Billable days after grace period
  const billableDays = diffDays;
  let fineAmount = billableDays * settings.fineRatePerDay;

  if (settings.maxFinePerBook && fineAmount > settings.maxFinePerBook) {
    fineAmount = settings.maxFinePerBook;
  }

  return {
    daysOverdue: diffDays,
    billableDays,
    fineAmount: parseFloat(fineAmount.toFixed(2)),
    ratePerDay: settings.fineRatePerDay,
  };
};
