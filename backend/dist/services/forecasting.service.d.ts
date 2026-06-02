import type { ForecastResult, ForecastPeriod } from "../types";
export declare const forecastingService: {
    forecastProduct(productId: string, periods: number, model: string): Promise<ForecastResult>;
    getHistoricalData(productId: string): Promise<number[]>;
    movingAverage(data: number[], periods: number, window?: number): ForecastPeriod[];
    linearRegression(data: number[], periods: number): ForecastPeriod[];
    arima(data: number[], periods: number): ForecastPeriod[];
    getDashboardSummary(): Promise<{
        productId: string;
        productName: string;
        currentStock: number;
        stockStatus: string;
    }[]>;
};
//# sourceMappingURL=forecasting.service.d.ts.map