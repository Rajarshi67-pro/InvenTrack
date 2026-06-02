export declare const oracleAnalyticsService: {
    getAccessToken(): Promise<string | null>;
    getStockPredictions(): Promise<{
        predictionScore: string;
        shortageRisks: number;
        reorderRecommendations: number;
        optimizationGain: string;
        source: string;
    } | {
        source: string;
        data: any;
    }>;
    getDashboardMetrics(): Promise<{
        predictionScore: string;
        shortageRisks: number;
        reorderRecommendations: number;
        optimizationGain: string;
        riskAlerts: {
            product: string;
            risk: string;
            daysToStockout: number;
        }[];
        source: string;
    }>;
    _mockData(): {
        predictionScore: string;
        shortageRisks: number;
        reorderRecommendations: number;
        optimizationGain: string;
        source: string;
    };
};
//# sourceMappingURL=oracle-analytics.service.d.ts.map