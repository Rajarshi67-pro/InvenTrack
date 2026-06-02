"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const exceljs_1 = __importDefault(require("exceljs"));
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const Warehouse_1 = require("../entities/Warehouse");
const Supplier_1 = require("../entities/Supplier");
const PurchaseOrder_1 = require("../entities/PurchaseOrder");
exports.reportService = {
    async generateReport(type, filters, format) {
        let data = [];
        let columns = [];
        let title = "";
        switch (type) {
            case "INVENTORY": {
                const qb = database_1.AppDataSource.getRepository(Product_1.Product).createQueryBuilder("p").where("p.is_active = 1");
                if (filters.warehouseId)
                    qb.andWhere("p.warehouse_id = :wid", { wid: filters.warehouseId });
                data = await qb.getMany();
                title = "Inventory Report";
                columns = [
                    { header: "SKU", key: "sku" }, { header: "Name", key: "name" }, { header: "Category", key: "category" },
                    { header: "Quantity", key: "quantity" }, { header: "Unit Price", key: "unitPrice" },
                    { header: "Stock Status", key: "stockStatus" }, { header: "Reorder Point", key: "reorderPoint" },
                ];
                break;
            }
            case "WAREHOUSE": {
                data = await database_1.AppDataSource.getRepository(Warehouse_1.Warehouse).find({ where: { isActive: 1 } });
                title = "Warehouse Report";
                columns = [{ header: "Name", key: "name" }, { header: "City", key: "city" }, { header: "Capacity", key: "capacity" }, { header: "Current Stock", key: "currentStockCount" }];
                break;
            }
            case "SUPPLIER": {
                data = await database_1.AppDataSource.getRepository(Supplier_1.Supplier).find({ where: { isActive: 1 } });
                title = "Supplier Report";
                columns = [{ header: "Name", key: "name" }, { header: "City", key: "city" }, { header: "Rating", key: "rating" }, { header: "Lead Time", key: "leadTimeDays" }];
                break;
            }
            case "PURCHASE": {
                data = await database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder).find({ relations: ["supplier"], order: { createdAt: "DESC" }, take: 500 });
                title = "Purchase Order Report";
                columns = [{ header: "PO Number", key: "poNumber" }, { header: "Status", key: "status" }, { header: "Total", key: "totalAmount" }];
                break;
            }
            default:
                data = [];
                title = "Report";
                columns = [];
        }
        if (format === "EXCEL")
            return exports.reportService._generateExcel(title, columns, data);
        if (format === "CSV")
            return exports.reportService._generateCSV(columns, data);
        return exports.reportService._generatePDF(title, columns, data);
    },
    async _generatePDF(title, columns, data) {
        return new Promise((resolve) => {
            const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.fontSize(22).fillColor("#1e3a8a").text("InvenTrack Pro", 50, 50);
            doc.fontSize(16).fillColor("#1e293b").text(title, 50, 80);
            doc.fontSize(9).fillColor("#64748b").text(`Generated: ${new Date().toLocaleString("en-IN")} · Total Records: ${data.length}`, 50, 105);
            doc.moveTo(50, 120).lineTo(545, 120).stroke("#e2e8f0");
            let y = 135;
            const colW = Math.floor(495 / columns.length);
            doc.fontSize(8).fillColor("#475569");
            columns.forEach((col, i) => { doc.text(col.header, 50 + i * colW, y, { width: colW, ellipsis: true }); });
            y += 18;
            doc.moveTo(50, y - 4).lineTo(545, y - 4).stroke("#e2e8f0");
            doc.fontSize(8).fillColor("#1e293b");
            data.slice(0, 100).forEach((row, ri) => {
                if (y > 750) {
                    doc.addPage();
                    y = 50;
                }
                if (ri % 2 === 0) {
                    doc.rect(50, y - 2, 495, 16).fillColor("#f8fafc").fill();
                    doc.fillColor("#1e293b");
                }
                columns.forEach((col, i) => { const val = String(row[col.key] ?? "—"); doc.text(val, 50 + i * colW, y, { width: colW, ellipsis: true }); });
                y += 16;
            });
            doc.end();
        });
    },
    async _generateExcel(title, columns, data) {
        const wb = new exceljs_1.default.Workbook();
        wb.creator = "InvenTrack Pro";
        const ws = wb.addWorksheet(title, { pageSetup: { fitToPage: true } });
        ws.addRow([title, "", `Generated: ${new Date().toLocaleString("en-IN")}`]).font = { bold: true, size: 14, color: { argb: "FF1E3A8A" } };
        ws.addRow([]);
        const headerRow = ws.addRow(columns.map((c) => c.header));
        headerRow.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; cell.alignment = { vertical: "middle", horizontal: "center" }; });
        data.forEach((row) => { ws.addRow(columns.map((col) => row[col.key] ?? "")); });
        ws.columns.forEach((col) => { col.width = 18; col.alignment = { vertical: "middle" }; });
        ws.autoFilter = { from: "A3", to: `${String.fromCharCode(64 + columns.length)}3` };
        return Buffer.from(await wb.xlsx.writeBuffer());
    },
    _generateCSV(columns, data) {
        const header = columns.map((c) => `"${c.header}"`).join(",");
        const rows = data.map((row) => columns.map((col) => `"${String(row[col.key] ?? "").replace(/"/g, '""')}"`).join(","));
        return Promise.resolve(Buffer.from([header, ...rows].join("\n"), "utf-8"));
    },
};
//# sourceMappingURL=report.service.js.map