import Settings from '../models/Settings.js';
import { logAudit } from '../middleware/audit.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    await logAudit({
      req,
      action: 'SETTINGS_UPDATED',
      targetType: 'Settings',
      targetId: settings._id,
      details: req.body,
    });

    res.json({
      success: true,
      message: 'Library configuration and policies updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
