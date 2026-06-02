import { Request, Response, NextFunction } from "express";
import { reportService } from "../services/report.service";

export const reportsController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { type = "INVENTORY", format = "PDF", startDate, endDate, warehouseId, productId, supplierId } = req.body;
      const buffer = await reportService.generateReport(type, { startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, warehouseId, productId, supplierId }, format);
      const ext = format === "PDF" ? "pdf" : format === "EXCEL" ? "xlsx" : "csv";
      const mime = format === "PDF" ? "application/pdf" : format === "EXCEL" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv";
      res.set({ "Content-Type": mime, "Content-Disposition": `attachment; filename="report-${type.toLowerCase()}.${ext}"`, "Content-Length": buffer.length });
      res.send(buffer);
    } catch (e) { next(e); }
  },
};