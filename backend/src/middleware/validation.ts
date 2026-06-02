import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: JSON.stringify(errors),
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }
    req[source] = result.data;
    next();
  };
};
