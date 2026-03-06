import * as dailyService from "../services/dailyClosing.service.js";
import { generateDailyExcel } from "../services/excel.service.js";
import path from "path";
import fs from "fs";

export const closeDay = async (req, res, next) => {
  try {
    const result = await dailyService.closeDay();
    res.json(result);
  } catch (error) {
   // console.error("Error in closeDay controller:", error);
    next(error);
  }
};

export const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    const report = await dailyService.getDailyReport(date);
    if (!report) return res.status(404).json({ message: "No report found" });

    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    // Use raw date string — no conversion to avoid UTC/IST timezone shift
    const formattedDate = date; // already YYYY-MM-DD
    let filePath = path.resolve(
      "reports",
      `Daily_Report_${formattedDate}.xlsx`,
    );

    // File missing? Regenerate on-demand from the DB record (handles old files with wrong UTC name)
    if (!fs.existsSync(filePath)) {
      const report = await dailyService.getDailyReport(date);
      if (!report) {
        return res
          .status(404)
          .json({
            message:
              "No daily closing found for this date. Close the day first.",
          });
      }
      filePath = await generateDailyExcel(report);
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Daily_Report_${formattedDate}.xlsx`,
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

export const reopenDay = async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "Date required" });

    const result = await dailyService.reopenDay(date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
