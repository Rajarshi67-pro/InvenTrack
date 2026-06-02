import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './Product';

@Entity('FORECASTS')
export class Forecast {
  @PrimaryColumn({ name: 'FORECAST_ID', type: 'varchar2', length: 36 })
  id!: string;

  @Column({ name: 'PRODUCT_ID', type: 'varchar2', length: 36 })
  productId!: string;

  @Column({ name: 'MODEL', type: 'varchar2', length: 30 })
  model!: string;

  @Column({ name: 'PERIOD_LABEL', type: 'varchar2', length: 50 })
  periodLabel!: string;

  @Column({ name: 'PERIOD_NUMBER', type: 'number' })
  periodNumber!: number;

  @Column({ name: 'PREDICTED_DEMAND', type: 'number', precision: 12, scale: 2 })
  predictedDemand!: number;

  @Column({ name: 'UPPER_BOUND', type: 'number', precision: 12, scale: 2 })
  upperBound!: number;

  @Column({ name: 'LOWER_BOUND', type: 'number', precision: 12, scale: 2 })
  lowerBound!: number;

  @Column({ name: 'REORDER_SUGGESTION', type: 'number', default: 0 })
  reorderSuggestion!: number;

  @Column({ name: 'SAFETY_STOCK', type: 'number', default: 0 })
  safetyStock!: number;

  @Column({ name: 'ACCURACY', type: 'number', precision: 5, scale: 2, default: 0 })
  accuracy!: number;

  @CreateDateColumn({ name: 'GENERATED_AT', type: 'date' })
  generatedAt!: Date;

  @ManyToOne(() => Product, (p) => p.forecasts)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: Product;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
