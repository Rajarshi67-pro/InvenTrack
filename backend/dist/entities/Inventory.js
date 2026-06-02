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
exports.Inventory = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Product_1 = require("./Product");
const Warehouse_1 = require("./Warehouse");
let Inventory = class Inventory {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Inventory = Inventory;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'INVENTORY_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Inventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Inventory.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Inventory.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY_ON_HAND', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityOnHand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY_RESERVED', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityReserved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY_AVAILABLE', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LAST_AUDIT_DATE', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastAuditDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LAST_COUNT_QUANTITY', type: 'number', nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "lastCountQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AVERAGE_COST', type: 'number', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "averageCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOTAL_VALUE', type: 'number', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Inventory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UPDATED_AT', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'PRODUCT_ID' }),
    __metadata("design:type", Product_1.Product)
], Inventory.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: 'WAREHOUSE_ID' }),
    __metadata("design:type", Warehouse_1.Warehouse)
], Inventory.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Inventory.prototype, "generateId", null);
exports.Inventory = Inventory = __decorate([
    (0, typeorm_1.Entity)('INVENTORY')
], Inventory);
//# sourceMappingURL=Inventory.js.map