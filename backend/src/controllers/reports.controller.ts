import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { reportService } from "../services/report.service";

export const reportsController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!AppDataSource.isInitialized) {
        const csv = "Product,SKU,Quantity,Unit Price,Total Value\nIndustrial Valve XL-500,IND-VLV-500,342,129.99,44457.18\nHydraulic Pump HP-300,HYD-PMP-300,18,899.50,16191.00\nSafety Helmet Pro,SAF-HLM-PRO,210,34.99,7347.90\n";
        res.set({ "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="demo-report.csv"', "Content-Length": String(Buffer.byteLength(csv)) });
        return res.send(Buffer.from(csv));
      }
      const { type = "INVENTORY", format = "PDF", startDate, endDate, warehouseId, productId, supplierId } = req.body;
      const buffer = await reportService.generateReport(type, { startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, warehouseId, productId, supplierId }, format);
      const ext = format === "PDF" ? "pdf" : format === "EXCEL" ? "xlsx" : "csv";
      const mime = format === "PDF" ? "application/pdf" : format === "EXCEL" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv";
      res.set({ "Content-Type": mime, "Content-Disposition": `attachment; filename="report-${type.toLowerCase()}.${ext}"`, "Content-Length": String(buffer.length) });
      res.send(buffer);
    } catch (e) { next(e); }
  },
};