import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Warehouse } from '../entities/Warehouse';
import { Product } from '../entities/Product';
import { Inventory } from '../entities/Inventory';
import { Supplier } from '../entities/Supplier';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { PurchaseOrderItem } from '../entities/PurchaseOrderItem';
import { StockMovement } from '../entities/StockMovement';
import { Forecast } from '../entities/Forecast';
import { Notification } from '../entities/Notification';
import { AuditLog } from '../entities/AuditLog';
import { RefreshToken } from '../entities/RefreshToken';

export const AppDataSource = new DataSource({
  type: 'oracle',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USER,
  password: env.DB_PASSWORD || env.DB_PASS || '',
  sid: env.DB_SID,
  serviceName: env.DB_SERVICE_NAME || undefined,
  entities: [
    User, Role, Warehouse, Product, Inventory,
    Supplier, PurchaseOrder, PurchaseOrderItem,
    StockMovement, Forecast, Notification, AuditLog, RefreshToken
  ],
  synchronize: false,
  logging: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  extra: {
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 30,
    connectTimeout: 30,
  },
});

export const connectDatabase = async (): Promise<void> => {
  // Skip connection if no meaningful host is configured
  const host = env.DB_HOST;
  const password = env.DB_PASSWORD || env.DB_PASS || '';
  if (!host || !password) {
    console.warn('⚠️  Oracle DB credentials not configured – running in degraded mode (DB routes will return 503).');
    return;
  }
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Oracle Database connected successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.warn('⚠️  Server starting in degraded mode – DB routes will return 503.');
    // Do NOT re-throw – let the server start so health checks pass.
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🔌 Database disconnected');
  }
};
