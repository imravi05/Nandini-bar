import * as auditService from "../services/audit.service.js";

/* GET AUDIT LOGS */

export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs"
    });
    next(error);
  }
};