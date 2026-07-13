import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './CommentEntity';
import { History } from './HistoryEntity';
import { Ticket } from './TicketEntity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @OneToMany(() => Ticket, (ticket) => ticket.requester)
  requestedTickets!: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.responsible)
  assignedTickets!: Ticket[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => History, (history) => history.user)
  histories!: History[];
}
