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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Warehouse_1 = require("./Warehouse");
const AuditLog_1 = require("./AuditLog");
const RefreshToken_1 = require("./RefreshToken");
const Notification_1 = require("./Notification");
let User = class User {
    generateId() {
        if (!this.id)
            this.id = (0, uuid_1.v4)();
    }
    toSafeObject() {
        const { passwordHash, resetToken, resetTokenExpiry, ...safe } = this;
        return safe;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'USER_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FULL_NAME', type: 'varchar2', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAIL', type: 'varchar2', length: 150, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PASSWORD_HASH', type: 'varchar2', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ROLE', type: 'varchar2', length: 20, default: 'MANAGER' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PHONE', type: 'varchar2', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_ACTIVE', type: 'number', default: 1 }),
    __metadata("design:type", Number)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAREHOUSE_ID', type: 'varchar2', length: 36, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LAST_LOGIN', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RESET_TOKEN', type: 'varchar2', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "resetToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RESET_TOKEN_EXPIRY', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "resetTokenExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FAILED_LOGIN_ATTEMPTS', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LOCKED_UNTIL', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lockedUntil", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Warehouse_1.Warehouse, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'WAREHOUSE_ID' }),
    __metadata("design:type", Warehouse_1.Warehouse)
], User.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RefreshToken_1.RefreshToken, (rt) => rt.user),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AuditLog_1.AuditLog, (al) => al.user),
    __metadata("design:type", Array)
], User.prototype, "auditLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notification_1.Notification, (n) => n.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "generateId", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('USERS')
], User);
//# sourceMappingURL=User.js.map