import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from './TicketEntity';
import { User } from './UserEntity';

@Entity('histories')
export class History {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  change!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.histories, { eager: true })
  user!: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.histories, {
    onDelete: 'CASCADE',
  })
  ticket!: Ticket;
}
