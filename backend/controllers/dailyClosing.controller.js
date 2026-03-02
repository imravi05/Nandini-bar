import * as dailyService from "../services/dailyClosing.service.js";

export const closeDay = async (req, res, next) => {
  try {
    const result = await dailyService.closeDay();
    console.log("Day closed successfully:", result);
    res.json(result);
  } catch (error) {
    console.error("Error closing day:", error);
   // next(error);
  }
};

export const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const report = await dailyService.getDailyReport(date);

    if (!report) {
      return res.status(404).json({ message: "No report found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching daily report:", error);
    // next(error);
  }
};

export const reopenDay = async (req, res, next) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const result = await dailyService.reopenDay(date);

    res.json(result);
  } catch (error) {
    console.error("Error reopening day:", error);
    return res.status(400).json({ message: "date is required for reopening the day " });
    
   //  next(error);
  }
};