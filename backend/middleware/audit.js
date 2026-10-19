import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  action,
  targetType,
  targetId,
  details = {},
  actor = null,
  actorName = '',
  actorRole = '',
}) => {
  try {
    const finalActor = actor || req?.user?._id || null;
    const finalActorName = actorName || req?.user?.name || 'System';
    const finalActorRole = actorRole || req?.user?.role || 'system';
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      action,
      actor: finalActor,
      actorName: finalActorName,
      actorRole: finalActorRole,
      targetType,
      targetId: String(targetId || ''),
      details,
      ipAddress,
    });
  } catch (error) {
    console.error(`[Audit Logging Error] Failed to record audit log: ${error.message}`);
  }
};
