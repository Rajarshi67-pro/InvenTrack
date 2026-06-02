import type { ReportFilters } from "../types";
export declare const reportService: {
    generateReport(type: string, filters: ReportFilters, format: string): Promise<Buffer>;
    _generatePDF(title: string, columns: {
        header: string;
        key: string;
    }[], data: Record<string, unknown>[]): Promise<Buffer>;
    _generateExcel(title: string, columns: {
        header: string;
        key: string;
    }[], data: Record<string, unknown>[]): Promise<Buffer>;
    _generateCSV(columns: {
        header: string;
        key: string;
    }[], data: Record<string, unknown>[]): Promise<Buffer>;
};
//# sourceMappingURL=report.service.d.ts.map