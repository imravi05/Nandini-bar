import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

export const generateDailyExcel = async (closingData) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Daily Report");

  const reportDate = new Date(closingData.date);
  // Use LOCAL date parts to avoid UTC offset shifting the date (e.g. IST midnight = UTC-1 day)
  const formattedDate = [
    reportDate.getFullYear(),
    String(reportDate.getMonth() + 1).padStart(2, "0"),
    String(reportDate.getDate()).padStart(2, "0"),
  ].join("-");

  // 🟢 TITLE
  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = "NANDINI BAR - DAILY SALES REPORT";
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.addRow([]);
  sheet.addRow(["Date:", formattedDate]);
  sheet.addRow([]);

  // 🟢 HEADER
  const headerRow = sheet.addRow([
    "Product",
    "OB",
    "Received",
    "Total",
    "Parcell",
    "Total",
    "Sale",
    "CB",
    "Sale Amount",
    "Closing Value",
  ]);

  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let totalSaleAmount = 0;
  let totalSoldQty = 0;
  let totalClosingValue = 0;
  let totalParcelQty = 0;

  const categoryTotals = {};

  for (const item of closingData.summaries) {
    const row = sheet.addRow([
      item.product.name,
      item.openingStock,
      item.receivedStock,
      item.totalStock,
      item.parcel,
      item.totalStock,
      item.soldQuantity,
      item.closingStock,
      item.saleAmount,
      item.closingValue,
    ]);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    totalSaleAmount += item.saleAmount;
    totalSoldQty += item.soldQuantity;
    totalClosingValue += item.closingValue;
    totalParcelQty += item.parcel;

    const category = item.product.category;

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    categoryTotals[category] += item.saleAmount;
  }

  sheet.addRow([]);

  // 🟢 TOTAL ROW
  const totalRow = sheet.addRow([
    "TOTAL",
    "",
    "",
    "",
    totalParcelQty,
    "",
    totalSoldQty,
    "",
    totalSaleAmount,
    // "",
    totalClosingValue,
  ]);

  totalRow.font = { bold: true };

  sheet.addRow([]);

  // 🟢 CATEGORY TOTALS
  sheet.addRow(["CATEGORY SUMMARY"]);
  for (const category in categoryTotals) {
    sheet.addRow([category, "", "", "", "", categoryTotals[category]]);
  }

  // 🟢 AUTO COLUMN WIDTH
  sheet.columns.forEach((column) => {
    column.width = 18;
  });

  const reportsDir = process.env.REPORTS_DIR || path.resolve("reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `Daily_Report_${formattedDate}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
