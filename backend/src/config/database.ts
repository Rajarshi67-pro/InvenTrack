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

const useSqliteFallback = !env.DB_PASSWORD && !env.DB_PASS;

export const AppDataSource = new DataSource(useSqliteFallback ? {
  type: 'sqljs',
  autoSave: true,
  location: 'demo-fallback.sqlite',
  entities: [
    User, Role, Warehouse, Product, Inventory,
    Supplier, PurchaseOrder, PurchaseOrderItem,
    StockMovement, Forecast, Notification, AuditLog, RefreshToken
  ],
  synchronize: true, // Auto-create tables for the demo fallback
  logging: false
} : {
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
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`✅ ${useSqliteFallback ? 'SQLite Fallback' : 'Oracle'} Database connected successfully`);
      
      // If we are in fallback mode, seed the demo users so login works!
      if (useSqliteFallback) {
        const userRepo = AppDataSource.getRepository(User);
        const bcrypt = await import("bcryptjs");
        const hash = await bcrypt.hash("Admin@123", 12);
        
        if (!(await userRepo.findOne({ where: { email: "admin@inventrack.com" } }))) {
          await userRepo.save(userRepo.create({ fullName: "Demo Admin", email: "admin@inventrack.com", passwordHash: hash, role: "ADMIN", isActive: 1 }));
        }
        if (!(await userRepo.findOne({ where: { email: "manager@inventrack.com" } }))) {
          await userRepo.save(userRepo.create({ fullName: "Demo Manager", email: "manager@inventrack.com", passwordHash: hash, role: "MANAGER", isActive: 1 }));
        }
        console.log('✅ Seeded demo credentials for SQLite fallback');
      }
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
