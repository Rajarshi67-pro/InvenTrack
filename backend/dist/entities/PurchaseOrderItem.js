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
exports.PurchaseOrderItem = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const PurchaseOrder_1 = require("./PurchaseOrder");
const Product_1 = require("./Product");
let PurchaseOrderItem = class PurchaseOrderItem {
    setTotalAndId() {
        if (!this.id)
            this.id = (0, uuid_1.v4)();
        this.totalPrice = this.quantity * this.unitPrice;
    }
};
exports.PurchaseOrderItem = PurchaseOrderItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'ITEM_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PO_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrderItem.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], PurchaseOrderItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUANTITY', type: 'number' }),
    __metadata("design:type", Number)
], PurchaseOrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UNIT_PRICE', type: 'number', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrderItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOTAL_PRICE', type: 'number', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrderItem.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RECEIVED_QUANTITY', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderItem.prototype, "receivedQuantity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseOrder_1.PurchaseOrder, (po) => po.items),
    (0, typeorm_1.JoinColumn)({ name: 'PO_ID' }),
    __metadata("design:type", PurchaseOrder_1.PurchaseOrder)
], PurchaseOrderItem.prototype, "purchaseOrder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, (p) => p.purchaseOrderItems),
    (0, typeorm_1.JoinColumn)({ name: 'PRODUCT_ID' }),
    __metadata("design:type", Product_1.Product)
], PurchaseOrderItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseOrderItem.prototype, "setTotalAndId", null);
exports.PurchaseOrderItem = PurchaseOrderItem = __decorate([
    (0, typeorm_1.Entity)('PURCHASE_ORDER_ITEMS')
], PurchaseOrderItem);
//# sourceMappingURL=PurchaseOrderItem.js.map