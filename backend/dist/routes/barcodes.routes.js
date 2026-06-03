"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const barcodes_controller_1 = require("../controllers/barcodes.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/lookup', barcodes_controller_1.barcodesController.lookup);
exports.default = router;
//# sourceMappingURL=barcodes.routes.js.map