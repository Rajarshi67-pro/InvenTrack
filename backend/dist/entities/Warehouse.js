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
exports.Warehouse = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Product_1 = require("./Product");
const StockMovement_1 = require("./StockMovement");
let Warehouse = class Warehouse {
    get utilizationPercent() {
        return this.capacity > 0 ? Math.round((this.currentStockCount / this.capacity) * 100) : 0;
    }
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Warehouse = Warehouse;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Warehouse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NAME', type: 'varchar2', length: 150 }),
    __metadata("design:type", String)
], Warehouse.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ADDRESS', type: 'varchar2', length: 300 }),
    __metadata("design:type", String)
], Warehouse.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CITY', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Warehouse.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATE', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Warehouse.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COUNTRY', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Warehouse.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PIN_CODE', type: 'varchar2', length: 20, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "pinCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CONTACT_PERSON', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], Warehouse.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CONTACT_PHONE', type: 'varchar2', length: 20 }),
    __metadata("design:type", String)
], Warehouse.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CONTACT_EMAIL', type: 'varchar2', length: 150, nullable: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CAPACITY', type: 'number' }),
    __metadata("design:type", Number)
], Warehouse.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CURRENT_STOCK_COUNT', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Warehouse.prototype, "currentStockCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_ACTIVE', type: 'number', default: 1 }),
    __metadata("design:type", Number)
], Warehouse.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Warehouse.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Warehouse.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product_1.Product, (p) => p.warehouse),
    __metadata("design:type", Array)
], Warehouse.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockMovement_1.StockMovement, (sm) => sm.warehouse),
    __metadata("design:type", Array)
], Warehouse.prototype, "stockMovements", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Warehouse.prototype, "generateId", null);
exports.Warehouse = Warehouse = __decorate([
    (0, typeorm_1.Entity)('WAREHOUSES')
], Warehouse);
//# sourceMappingURL=Warehouse.js.map