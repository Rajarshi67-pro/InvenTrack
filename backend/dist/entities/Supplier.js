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
exports.Supplier = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Product_1 = require("./Product");
const PurchaseOrder_1 = require("./PurchaseOrder");
let Supplier = class Supplier {
    get deliveryPerformance() {
        if (this.totalOrders === 0)
            return 0;
        return Math.round((this.onTimeDeliveries / this.totalOrders) * 100);
    }
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Supplier = Supplier;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'SUPPLIER_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Supplier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NAME', type: 'varchar2', length: 150 }),
    __metadata("design:type", String)
], Supplier.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CONTACT_PERSON', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Supplier.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PHONE', type: 'varchar2', length: 20 }),
    __metadata("design:type", String)
], Supplier.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAIL', type: 'varchar2', length: 150 }),
    __metadata("design:type", String)
], Supplier.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ADDRESS', type: 'varchar2', length: 300 }),
    __metadata("design:type", String)
], Supplier.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CITY', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Supplier.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATE', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Supplier.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COUNTRY', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Supplier.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GST_NUMBER', type: 'varchar2', length: 20, nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LEAD_TIME_DAYS', type: 'number', default: 7 }),
    __metadata("design:type", Number)
], Supplier.prototype, "leadTimeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PAYMENT_TERMS', type: 'varchar2', length: 200, nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RATING', type: 'number', precision: 3, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], Supplier.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOTAL_ORDERS', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Supplier.prototype, "totalOrders", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ON_TIME_DELIVERIES', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Supplier.prototype, "onTimeDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NOTES', type: 'varchar2', length: 500, nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_ACTIVE', type: 'number', default: 1 }),
    __metadata("design:type", Number)
], Supplier.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Supplier.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Supplier.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product_1.Product, (p) => p.supplier),
    __metadata("design:type", Array)
], Supplier.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseOrder_1.PurchaseOrder, (po) => po.supplier),
    __metadata("design:type", Array)
], Supplier.prototype, "purchaseOrders", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Supplier.prototype, "generateId", null);
exports.Supplier = Supplier = __decorate([
    (0, typeorm_1.Entity)('SUPPLIERS')
], Supplier);
//# sourceMappingURL=Supplier.js.map