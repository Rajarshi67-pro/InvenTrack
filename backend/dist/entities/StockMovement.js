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
exports.StockMovement = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Product_1 = require("./Product");
const Warehouse_1 = require("./Warehouse");
const User_1 = require("./User");
let StockMovement = class StockMovement {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'MOVEMENT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], StockMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], StockMovement.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MOVEMENT_TYPE', type: 'varchar2', length: 20 }),
    __metadata("design:type", String)
], StockMovement.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY', type: 'number' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FROM_WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "fromWarehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TO_WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "toWarehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PURCHASE_ORDER_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BATCH_NUMBER', type: 'varchar2', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EXPIRY_DATE', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockMovement.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UNIT_COST', type: 'number', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockMovement.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PERFORMED_BY', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], StockMovement.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'REMARKS', type: 'varchar2', length: 500, nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BARCODE_SCAN', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], StockMovement.prototype, "wasBarcodeScan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, (p) => p.stockMovements),
    (0, typeorm_1.JoinColumn)({ name: 'PRODUCT_ID' }),
    __metadata("design:type", Product_1.Product)
], StockMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse_1.Warehouse, (w) => w.stockMovements),
    (0, typeorm_1.JoinColumn)({ name: 'WAREHOUSE_ID' }),
    __metadata("design:type", Warehouse_1.Warehouse)
], StockMovement.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'PERFORMED_BY' }),
    __metadata("design:type", User_1.User)
], StockMovement.prototype, "performer", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockMovement.prototype, "generateId", null);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)('STOCK_MOVEMENTS')
], StockMovement);
//# sourceMappingURL=StockMovement.js.map