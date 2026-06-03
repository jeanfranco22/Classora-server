import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../transactions/transactions.entity';

@Entity({ name: 'token_packages' })
export class TokenPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: false })
  tokenAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.tokenPackage)
  transactions: Transaction[];
}
