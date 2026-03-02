import api from "./api";

const dailyClosingService = {
  /** GET /api/daily/report?date=YYYY-MM-DD */
  getReport: async (date) => {
    const res = await api.get("/daily/report", { params: { date } });
    return res.data;
  },

  /**
   * GET /api/sales?startDate=&endDate=&limit=500
   * Fetches ALL of today's completed sales in one shot.
   * limit=500 is safe — a bar won't do 500 transactions in one day.
   */
  getTodaySales: async (date) => {
    // Pass explicit start/end times so the backend gte/lte covers the FULL day.
    // Without this, both resolve to the same midnight UTC timestamp and match nothing.
    const res = await api.get("/sales", {
      params: {
        startDate: `${date}T00:00:00`,
        endDate: `${date}T23:59:59`,
        limit: 500,
        page: 1,
      },
    });
    return res.data?.data ?? [];
  },

  /** POST /api/daily/close — closes today */
  closeDay: async () => {
    const res = await api.post("/daily/close");
    return res.data;
  },

  /** POST /api/daily/reopen — reopen a closed day (admin) */
  reopenDay: async (date) => {
    const res = await api.post("/daily/reopen", { date });
    return res.data;
  },
};

export default dailyClosingService;
