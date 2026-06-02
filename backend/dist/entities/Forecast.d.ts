import { Product } from './Product';
export declare class Forecast {
    id: string;
    productId: string;
    model: string;
    periodLabel: string;
    periodNumber: number;
    predictedDemand: number;
    upperBound: number;
    lowerBound: number;
    reorderSuggestion: number;
    safetyStock: number;
    accuracy: number;
    generatedAt: Date;
    product: Product;
    generateId(): void;
}
//# sourceMappingURL=Forecast.d.ts.map