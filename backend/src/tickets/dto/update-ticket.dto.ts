import { TicketPriority, TicketStatus } from '../../entities/TicketEntity';

export class UpdateTicketDto {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  dueDate?: string;
  categoryId?: number;
  requesterId?: number;
  responsibleId?: number;
}
