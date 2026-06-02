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
exports.RefreshToken = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_1 = require("./User");
let RefreshToken = class RefreshToken {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
    get isExpired() {
        return new Date() > this.expiresAt;
    }
};
exports.RefreshToken = RefreshToken;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'TOKEN_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'USER_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOKEN', type: 'varchar2', length: 500, unique: true }),
    __metadata("design:type", String)
], RefreshToken.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOKEN_FAMILY', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tokenFamily", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EXPIRES_AT', type: 'date' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IS_REVOKED', type: 'number', default: 0 }),
    __metadata("design:type", Number)
], RefreshToken.prototype, "isRevoked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATED_AT', type: 'date' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (u) => u.refreshTokens),
    (0, typeorm_1.JoinColumn)({ name: 'USER_ID' }),
    __metadata("design:type", User_1.User)
], RefreshToken.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RefreshToken.prototype, "generateId", null);
exports.RefreshToken = RefreshToken = __decorate([
    (0, typeorm_1.Entity)('REFRESH_TOKENS')
], RefreshToken);
//# sourceMappingURL=RefreshToken.js.map