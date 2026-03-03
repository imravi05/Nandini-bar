import api from "./api";

const auditService = {
  /**
   * GET /api/audit
   * Supports: entityType, entityId, startDate, endDate, page, limit
   */
  getLogs: async (params = {}) => {
    const res = await api.get("/audit", { params });
    return res.data; // { success, data: [], pagination: {} }
  },
};

export default auditService;
