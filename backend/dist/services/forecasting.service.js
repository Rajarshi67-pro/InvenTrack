"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastingService = void 0;
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const StockMovement_1 = require("../entities/StockMovement");
const Forecast_1 = require("../entities/Forecast");
const errorHandler_1 = require("../middleware/errorHandler");
// Simple ARIMA(1,1,1) helper
function acf(data, lag) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    let num = 0, den = 0;
    for (let i = 0; i < data.length; i++)
        den += (data[i] - mean) ** 2;
    for (let i = lag; i < data.length; i++)
        num += (data[i] - mean) * (data[i - lag] - mean);
    return den === 0 ? 0 : num / den;
}
function difference(data) {
    return data.slice(1).map((v, i) => v - data[i]);
}
function mape(predicted, actual) {
    const valid = actual.filter((a) => a !== 0);
    if (valid.length === 0)
        return 0;
    const total = actual.reduce((sum, a, i) => {
        if (a === 0)
            return sum;
        return sum + Math.abs((a - predicted[i]) / a);
    }, 0);
    return Math.max(0, Math.min(100, 100 - (total / valid.length) * 100));
}
exports.forecastingService = {
    async forecastProduct(productId, periods, model) {
        const product = await database_1.AppDataSource.getRepository(Product_1.Product).findOne({ where: { id: productId } });
        if (!product)
            throw (0, errorHandler_1.createError)("Product not found", 404);
        const historical = await exports.forecastingService.getHistoricalData(productId);
        if (historical.length < 3)
            throw (0, errorHandler_1.createError)("Insufficient historical data (minimum 3 months required)", 422);
        let predictions;
        switch (model) {
            case "LINEAR_REGRESSION":
                predictions = exports.forecastingService.linearRegression(historical, periods);
                break;
            case "ARIMA":
                predictions = exports.forecastingService.arima(historical, periods);
                break;
            default: predictions = exports.forecastingService.movingAverage(historical, periods);
        }
        const avgDemand = predictions.reduce((s, p) => s + p.predictedDemand, 0) / predictions.length;
        const accuracy = mape(predictions.slice(0, historical.length).map((p) => p.predictedDemand), historical.slice(-predictions.length));
        const reorderSuggestion = Math.ceil(avgDemand * (product.reorderPoint / 30));
        const safetyStock = Math.ceil(avgDemand * 0.2);
        // Persist forecasts
        const repo = database_1.AppDataSource.getRepository(Forecast_1.Forecast);
        const toSave = predictions.map((p) => repo.create({ productId, model, periodLabel: p.label, periodNumber: p.period, predictedDemand: p.predictedDemand, upperBound: p.upperBound, lowerBound: p.lowerBound, reorderSuggestion, safetyStock, accuracy }));
        await repo.save(toSave);
        return { productId, productName: product.name, model: model, predictions, reorderSuggestion, safetyStock, accuracy };
    },
    async getHistoricalData(productId) {
        const movements = await database_1.AppDataSource.getRepository(StockMovement_1.StockMovement)
            .createQueryBuilder("sm")
            .where("sm.product_id = :productId", { productId })
            .andWhere("sm.movement_type IN (:...types)", { types: ["OUT"] })
            .andWhere("sm.created_at >= ADD_MONTHS(SYSDATE, -24)")
            .orderBy("sm.created_at", "ASC")
            .getMany();
        // Aggregate by month
        const monthly = {};
        const now = new Date();
        for (let m = 23; m >= 0; m--) {
            const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthly[key] = 0;
        }
        movements.forEach((mv) => {
            const d = new Date(mv.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (monthly[key] !== undefined)
                monthly[key] += mv.quantity;
        });
        return Object.values(monthly);
    },
    movingAverage(data, periods, window = 3) {
        const extended = [...data];
        const results = [];
        const now = new Date();
        for (let i = 0; i < periods; i++) {
            const slice = extended.slice(-window);
            const predicted = slice.reduce((a, b) => a + b, 0) / slice.length;
            const std = Math.sqrt(slice.reduce((s, v) => s + (v - predicted) ** 2, 0) / slice.length);
            const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
            const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            results.push({ period: i + 1, label, predictedDemand: Math.round(Math.max(0, predicted)), upperBound: Math.round(predicted + 2 * std), lowerBound: Math.round(Math.max(0, predicted - 2 * std)) });
            extended.push(predicted);
        }
        return results;
    },
    linearRegression(data, periods) {
        const n = data.length;
        const xMean = (n - 1) / 2;
        const yMean = data.reduce((a, b) => a + b, 0) / n;
        let num = 0, den = 0;
        data.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
        const slope = den === 0 ? 0 : num / den;
        const intercept = yMean - slope * xMean;
        const residuals = data.map((y, x) => y - (intercept + slope * x));
        const rmse = Math.sqrt(residuals.reduce((s, r) => s + r ** 2, 0) / n);
        const now = new Date();
        return Array.from({ length: periods }, (_, i) => {
            const x = n + i;
            const predicted = Math.max(0, intercept + slope * x);
            const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
            const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            return { period: i + 1, label, predictedDemand: Math.round(predicted), upperBound: Math.round(predicted + 1.96 * rmse), lowerBound: Math.round(Math.max(0, predicted - 1.96 * rmse)) };
        });
    },
    arima(data, periods) {
        // ARIMA(1,1,1): difference → AR(1) → integrate → MA correction
        const diff = difference(data);
        const ar1 = acf(diff, 1) / acf(diff, 0);
        const residuals = diff.slice(1).map((d, i) => d - ar1 * diff[i]);
        const ma1 = residuals.length > 1 ? residuals.slice(1).reduce((s, r, i) => s + r * residuals[i], 0) / residuals.reduce((s, r) => s + r * r, 1) : 0;
        const maStd = Math.sqrt(residuals.reduce((s, r) => s + r ** 2, 0) / Math.max(residuals.length, 1));
        let lastDiff = diff[diff.length - 1] || 0;
        let lastRes = residuals[residuals.length - 1] || 0;
        let lastVal = data[data.length - 1] || 0;
        const now = new Date();
        return Array.from({ length: periods }, (_, i) => {
            const noise = 0;
            const nextDiff = ar1 * lastDiff + ma1 * lastRes + noise;
            const predicted = Math.max(0, lastVal + nextDiff);
            lastRes = nextDiff - ar1 * lastDiff;
            lastDiff = nextDiff;
            lastVal = predicted;
            const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
            const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            return { period: i + 1, label, predictedDemand: Math.round(predicted), upperBound: Math.round(predicted + 1.96 * maStd), lowerBound: Math.round(Math.max(0, predicted - 1.96 * maStd)) };
        });
    },
    async getDashboardSummary() {
        const products = await database_1.AppDataSource.getRepository(Product_1.Product).find({ where: { isActive: 1 }, take: 5, order: { quantity: "DESC" } });
        return products.map((p) => ({ productId: p.id, productName: p.name, currentStock: p.quantity, stockStatus: p.stockStatus }));
    },
};
//# sourceMappingURL=forecasting.service.js.map