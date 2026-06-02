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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Warehouse_1 = require("./Warehouse");
const Supplier_1 = require("./Supplier");
const StockMovement_1 = require("./StockMovement");
const PurchaseOrderItem_1 = require("./PurchaseOrderItem");
const Forecast_1 = require("./Forecast");
let Product = class Product {
    get stockStatus() {
        if (this.quantity === 0)
            return 'OUT_OF_STOCK';
        if (this.quantity <= this.minStockLevel)
            return 'LOW_STOCK';
        if (this.quantity >= this.maxStockLevel)
            return 'OVERSTOCK';
        return 'NORMAL';
    }
    get inventoryValue() {
        return this.quantity * this.unitPrice;
    }
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SKU', type: 'varchar2', length: 100, unique: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NAME', type: 'varchar2', length: 200 }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CATEGORY', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DESCRIPTION', type: 'varchar2', length: 1000, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UNIT_PRICE', type: 'number', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MIN_STOCK_LEVEL', type: 'number', default: 10 }),
    __metadata("design:type", Number)
], Product.prototype, "minStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MAX_STOCK_LEVEL', type: 'number', default: 1000 }),
    __metadata("design:type", Number)
], Product.prototype, "maxStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'REORDER_POINT', type: 'number', default: 20 }),
    __metadata("design:type", Number)
], Product.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UNIT_OF_MEASURE', type: 'varchar2', length: 50, default: 'UNIT' }),
    __metadata("design:type", String)
], Product.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WEIGHT', type: 'number', nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DIMENSIONS', type: 'varchar2', length: 100, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "dimensions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BARCODE', type: 'varchar2', length: 255, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BARCODE_TYPE', type: 'varchar2', length: 20, default: 'CODE128' }),
    __metadata("design:type", String)
], Product.prototype, "barcodeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_ACTIVE', type: 'number', default: 1 }),
    __metadata("design:type", Number)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse_1.Warehouse, (w) => w.products, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'WAREHOUSE_ID' }),
    __metadata("design:type", Warehouse_1.Warehouse)
], Product.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, (s) => s.products, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'SUPPLIER_ID' }),
    __metadata("design:type", Supplier_1.Supplier)
], Product.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockMovement_1.StockMovement, (sm) => sm.product),
    __metadata("design:type", Array)
], Product.prototype, "stockMovements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseOrderItem_1.PurchaseOrderItem, (poi) => poi.product),
    __metadata("design:type", Array)
], Product.prototype, "purchaseOrderItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Forecast_1.Forecast, (f) => f.product),
    __metadata("design:type", Array)
], Product.prototype, "forecasts", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Product.prototype, "generateId", null);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('PRODUCTS')
], Product);
//# sourceMappingURL=Product.js.map