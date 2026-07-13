import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './CategorieEntity';
import { User } from './UserEntity';
import { Comment } from './CommentEntity';
import { History } from './HistoryEntity';

export enum TicketPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export enum TicketStatus {
  ABERTO = 'Aberto',
  EM_ATENDIMENTO = 'Em Atendimento',
  AGUARDANDO_USUARIO = 'Aguardando Usuário',
  FINALIZADO = 'Finalizado',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 20, default: TicketPriority.MEDIA })
  priority!: TicketPriority;

  @Column({ type: 'varchar', length: 30, default: TicketStatus.ABERTO })
  status!: TicketStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @ManyToOne(() => Category, (category) => category.tickets, { eager: true })
  category!: Category;

  @ManyToOne(() => User, (user) => user.assignedTickets, {
    eager: true,
    nullable: true,
  })
  responsible?: User;

  @ManyToOne(() => User, (user) => user.requestedTickets, { eager: true })
  requester!: User;

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments!: Comment[];

  @OneToMany(() => History, (history) => history.ticket)
  histories!: History[];
}
