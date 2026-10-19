import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      default: 'Athena Central Library',
    },
    institutionName: {
      type: String,
      default: 'Institute of Advanced Technology & Research',
    },
    defaultLoanDaysStudent: {
      type: Number,
      default: 14,
    },
    defaultLoanDaysFaculty: {
      type: Number,
      default: 30,
    },
    gracePeriodDays: {
      type: Number,
      default: 1,
    },
    fineRatePerDay: {
      type: Number,
      default: 2.00,
    },
    maxFinePerBook: {
      type: Number,
      default: 50.00,
    },
    maxBooksStudent: {
      type: Number,
      default: 4,
    },
    maxBooksFaculty: {
      type: Number,
      default: 10,
    },
    maxRenewalsAllowed: {
      type: Number,
      default: 2,
    },
    holdExpirationHours: {
      type: Number,
      default: 48,
    },
    contactEmail: {
      type: String,
      default: 'library@athena.edu',
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 234-5678',
    },
    address: {
      type: String,
      default: 'Academic Boulevard, Building 4, North Wing',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
