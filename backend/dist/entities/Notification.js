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
exports.Notification = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_1 = require("./User");
let Notification = class Notification {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'NOTIFICATION_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'USER_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TYPE', type: 'varchar2', length: 50 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TITLE', type: 'varchar2', length: 200 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MESSAGE', type: 'varchar2', length: 1000 }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ENTITY_TYPE', type: 'varchar2', length: 50, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ENTITY_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_READ', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SEVERITY', type: 'varchar2', length: 20, default: 'LOW' }),
    __metadata("design:type", String)
], Notification.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (u) => u.notifications),
    (0, typeorm_1.JoinColumn)({ name: 'USER_ID' }),
    __metadata("design:type", User_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Notification.prototype, "generateId", null);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('NOTIFICATIONS')
], Notification);
//# sourceMappingURL=Notification.js.map