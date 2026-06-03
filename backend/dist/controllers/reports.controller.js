"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const database_1 = require("../config/database");
const report_service_1 = require("../services/report.service");
exports.reportsController = {
    async generate(req, res, next) {
        try {
            if (!database_1.AppDataSource.isInitialized) {
                const csv = "Product,SKU,Quantity,Unit Price,Total Value\nIndustrial Valve XL-500,IND-VLV-500,342,129.99,44457.18\nHydraulic Pump HP-300,HYD-PMP-300,18,899.50,16191.00\nSafety Helmet Pro,SAF-HLM-PRO,210,34.99,7347.90\n";
                res.set({ "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="demo-report.csv"', "Content-Length": String(Buffer.byteLength(csv)) });
                return res.send(Buffer.from(csv));
            }
            const { type = "INVENTORY", format = "PDF", startDate, endDate, warehouseId, productId, supplierId } = req.body;
            const buffer = await report_service_1.reportService.generateReport(type, { startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, warehouseId, productId, supplierId }, format);
            const ext = format === "PDF" ? "pdf" : format === "EXCEL" ? "xlsx" : "csv";
            const mime = format === "PDF" ? "application/pdf" : format === "EXCEL" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv";
            res.set({ "Content-Type": mime, "Content-Disposition": `attachment; filename="report-${type.toLowerCase()}.${ext}"`, "Content-Length": String(buffer.length) });
            res.send(buffer);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=reports.controller.js.map