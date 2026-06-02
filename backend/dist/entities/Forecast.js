"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forecast = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Product_1 = require("./Product");
let Forecast = class Forecast {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Forecast = Forecast;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'FORECAST_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Forecast.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Forecast.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MODEL', type: 'varchar2', length: 30 }),
    __metadata("design:type", String)
], Forecast.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PERIOD_LABEL', type: 'varchar2', length: 50 }),
    __metadata("design:type", String)
], Forecast.prototype, "periodLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PERIOD_NUMBER', type: 'number' }),
    __metadata("design:type", Number)
], Forecast.prototype, "periodNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PREDICTED_DEMAND', type: 'number', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Forecast.prototype, "predictedDemand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UPPER_BOUND', type: 'number', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Forecast.prototype, "upperBound", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LOWER_BOUND', type: 'number', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Forecast.prototype, "lowerBound", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'REORDER_SUGGESTION', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Forecast.prototype, "reorderSuggestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SAFETY_STOCK', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Forecast.prototype, "safetyStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ACCURACY', type: 'number', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Forecast.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'GENERATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Forecast.prototype, "generatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, (p) => p.forecasts),
    (0, typeorm_1.JoinColumn)({ name: 'PRODUCT_ID' }),
    __metadata("design:type", Product_1.Product)
], Forecast.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Forecast.prototype, "generateId", null);
exports.Forecast = Forecast = __decorate([
    (0, typeorm_1.Entity)('FORECASTS')
], Forecast);
//# sourceMappingURL=Forecast.js.map