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
exports.Role = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let Role = class Role {
    generateId() { if (!this.id)
        this.id = (0, uuid_1.v4)(); }
    getPermissions() {
        try {
            return JSON.parse(this.permissions || '[]');
        }
        catch {
            return [];
        }
    }
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'ROLE_ID', type: 'varchar2', length: 36 }),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NAME', type: 'varchar2', length: 50, unique: true }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DESCRIPTION', type: 'varchar2', length: 300, nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PERMISSIONS', type: 'clob', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Role.prototype, "generateId", null);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('ROLES')
], Role);
//# sourceMappingURL=Role.js.map