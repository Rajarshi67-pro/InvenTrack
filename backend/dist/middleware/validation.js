"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: JSON.stringify(errors),
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req[source] = result.data;
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map