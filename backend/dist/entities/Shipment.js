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
exports.Shipment = void 0;
const typeorm_1 = require("typeorm");
let Shipment = class Shipment {
};
exports.Shipment = Shipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Shipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_number', unique: true }),
    __metadata("design:type", String)
], Shipment.prototype, "shipmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', default: 'INBOUND' }),
    __metadata("design:type", String)
], Shipment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'CREATED' }),
    __metadata("design:type", String)
], Shipment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carrier', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "carrier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tracking_number', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_delivery', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "expectedDelivery", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_delivery', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "actualDelivery", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: 1 }),
    __metadata("design:type", Number)
], Shipment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Shipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Shipment.prototype, "updatedAt", void 0);
exports.Shipment = Shipment = __decorate([
    (0, typeorm_1.Entity)('shipments')
], Shipment);
//# sourceMappingURL=Shipment.js.map