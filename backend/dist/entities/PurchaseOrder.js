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
exports.PurchaseOrder = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Supplier_1 = require("./Supplier");
const Warehouse_1 = require("./Warehouse");
const User_1 = require("./User");
const PurchaseOrderItem_1 = require("./PurchaseOrderItem");
let PurchaseOrder = class PurchaseOrder {
    generateId() {
        if (!this.id)
            this.id = (0, uuid_1.v4)();
        if (!this.poNumber) {
            const date = new Date();
            this.poNumber = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        }
    }
};
exports.PurchaseOrder = PurchaseOrder;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'PO_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PO_NUMBER', type: 'varchar2', length: 50, unique: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "poNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CREATED_BY', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'APPROVED_BY', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATUS', type: 'varchar2', length: 20, default: 'DRAFT' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOTAL_AMOUNT', type: 'number', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EXPECTED_DELIVERY_DATE', type: 'date' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ACTUAL_DELIVERY_DATE', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NOTES', type: 'varchar2', length: 500, nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, (s) => s.purchaseOrders),
    (0, typeorm_1.JoinColumn)({ name: 'SUPPLIER_ID' }),
    __metadata("design:type", Supplier_1.Supplier)
], PurchaseOrder.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: 'WAREHOUSE_ID' }),
    __metadata("design:type", Warehouse_1.Warehouse)
], PurchaseOrder.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'CREATED_BY' }),
    __metadata("design:type", User_1.User)
], PurchaseOrder.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseOrderItem_1.PurchaseOrderItem, (poi) => poi.purchaseOrder, { cascade: true }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseOrder.prototype, "generateId", null);
exports.PurchaseOrder = PurchaseOrder = __decorate([
    (0, typeorm_1.Entity)('PURCHASE_ORDERS')
], PurchaseOrder);
//# sourceMappingURL=PurchaseOrder.js.map