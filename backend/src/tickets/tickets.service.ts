import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/CategorieEntity';
import { Comment } from '../entities/CommentEntity';
import { History } from '../entities/HistoryEntity';
import { Ticket, TicketPriority, TicketStatus } from '../entities/TicketEntity';
import { User } from '../entities/UserEntity';

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async create(data: any): Promise<Ticket> {
    const ticket = await this.prepareTicket(data);
    const savedTicket = await this.ticketRepository.save(ticket);
    await this.logHistory(
      savedTicket,
      data.userId ?? data.createdByUserId,
      'Chamado criado',
    );
    return this.findOne(savedTicket.id);
  }

  async findAll(
    query: Record<string, string | undefined> = {},
  ): Promise<TicketListResponse> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Math.min(50, Number(query.limit ?? 10)));
    const subject = query.subject?.trim();
    const requester = query.requester?.trim();
    const categoryId = query.categoryId?.trim();
    const priority = query.priority?.trim();
    const status = query.status?.trim();
    const sortBy = query.sortBy?.trim() || 'createdAt';
    const order = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.category', 'category')
      .leftJoinAndSelect('ticket.requester', 'requester')
      .leftJoinAndSelect('ticket.responsible', 'responsible');

    if (subject) {
      qb.andWhere('LOWER(ticket.subject) LIKE :subject', {
        subject: `%${subject.toLowerCase()}%`,
      });
    }

    if (requester) {
      qb.andWhere(
        '(LOWER(requester.name) LIKE :requester OR LOWER(requester.email) LIKE :requester)',
        { requester: `%${requester.toLowerCase()}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: Number(categoryId),
      });
    }

    if (priority) {
      qb.andWhere('ticket.priority = :priority', { priority });
    }

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    const allowedSortBy = new Set([
      'id',
      'subject',
      'priority',
      'status',
      'createdAt',
      'dueDate',
      'category',
      'requester',
    ]);
    const sortField = allowedSortBy.has(sortBy) ? sortBy : 'createdAt';

    if (sortField === 'category') {
      qb.orderBy('category.name', order);
    } else if (sortField === 'requester') {
      qb.orderBy('requester.name', order);
    } else {
      qb.orderBy(`ticket.${sortField}`, order);
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        category: true,
        responsible: true,
        requester: true,
        comments: {
          user: true,
        },
        histories: {
          user: true,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Chamado com id ${id} não encontrado`);
    }

    return ticket;
  }

  async update(id: number, data: any): Promise<Ticket> {
    const currentTicket = await this.findOne(id);
    const prepared = await this.prepareTicket(
      { ...currentTicket, ...data },
      currentTicket.id,
    );
    const savedTicket = await this.ticketRepository.save(prepared);
    const historyEntry = await this.buildHistoryChange(currentTicket, data);
    if (historyEntry) {
      await this.logHistory(
        savedTicket,
        data.userId ?? data.updatedByUserId,
        historyEntry,
      );
    }
    return this.findOne(savedTicket.id);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  async createComment(
    ticketId: number,
    data: { text?: string; userId?: number },
  ): Promise<Comment> {
    const ticket = await this.findOne(ticketId);
    const text = data.text?.trim();

    if (!text) {
      throw new BadRequestException('Informe o texto do comentário.');
    }

    const user = await this.getUserById(data.userId ?? 1);
    const comment = this.commentRepository.create({
      text,
      ticket,
      user,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(ticketId: number): Promise<Comment[]> {
    await this.findOne(ticketId);
    return this.commentRepository.find({
      where: { ticket: { id: ticketId } },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getHistory(ticketId: number): Promise<History[]> {
    await this.findOne(ticketId);
    return this.historyRepository.find({
      where: { ticket: { id: ticketId } },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getDashboardSummary(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    finished: number;
    overdue: number;
  }> {
    const tickets = await this.ticketRepository.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const open = tickets.filter(
      (ticket) => ticket.status === TicketStatus.ABERTO,
    ).length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === TicketStatus.EM_ATENDIMENTO,
    ).length;
    const finished = tickets.filter(
      (ticket) => ticket.status === TicketStatus.FINALIZADO,
    ).length;
    const overdue = tickets.filter((ticket) => {
      if (!ticket.dueDate || ticket.status === TicketStatus.FINALIZADO) {
        return false;
      }

      const dueDate = new Date(ticket.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    return {
      total: tickets.length,
      open,
      inProgress,
      finished,
      overdue,
    };
  }

  private async prepareTicket(data: any, existingId?: number): Promise<Ticket> {
    const categoryId = data.categoryId ?? data.category?.id;
    const requesterId = data.requesterId ?? data.requester?.id;
    const responsibleId = data.responsibleId ?? data.responsible?.id;

    const ticket = this.ticketRepository.create({
      ...data,
      subject: data.subject?.trim(),
      description: data.description?.trim(),
      priority: this.normalizePriority(data.priority),
      status: this.normalizeStatus(data.status),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    }) as unknown as Ticket;

    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: Number(categoryId) },
      });
      if (category) {
        ticket.category = category;
      }
    }

    if (requesterId) {
      const requester = await this.userRepository.findOne({
        where: { id: Number(requesterId) },
      });
      if (requester) {
        ticket.requester = requester;
      }
    }

    if (responsibleId) {
      const responsible = await this.userRepository.findOne({
        where: { id: Number(responsibleId) },
      });
      if (responsible) {
        ticket.responsible = responsible;
      }
    }

    if (!existingId && !ticket.requester) {
      const requester = await this.userRepository.findOne({ where: { id: 1 } });
      if (requester) {
        ticket.requester = requester;
      }
    }

    return ticket;
  }

  private async getUserById(userId?: number): Promise<User> {
    const id = Number(userId ?? 1);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    return user;
  }

  private async logHistory(
    ticket: Ticket,
    userId: number | string | undefined,
    change: string,
  ): Promise<void> {
    const user = await this.getUserById(Number(userId ?? 1));
    if (!change.trim()) {
      return;
    }

    const history = this.historyRepository.create({
      change: change.trim(),
      ticket,
      user,
    });

    await this.historyRepository.save(history);
  }

  private async buildHistoryChange(
    previous: Ticket,
    data: any,
  ): Promise<string | null> {
    const changes: string[] = [];

    const nextPriority = data.priority
      ? this.normalizePriority(data.priority)
      : undefined;
    if (nextPriority && previous.priority !== nextPriority) {
      changes.push(
        `Prioridade alterada: ${previous.priority} → ${nextPriority}`,
      );
    }

    const nextStatus = data.status
      ? this.normalizeStatus(data.status)
      : undefined;
    if (nextStatus && previous.status !== nextStatus) {
      changes.push(`Status alterado: ${previous.status} → ${nextStatus}`);
    }

    const nextCategoryId = data.categoryId ?? data.category?.id;
    if (nextCategoryId && previous.category?.id !== Number(nextCategoryId)) {
      const category = await this.categoryRepository.findOne({
        where: { id: Number(nextCategoryId) },
      });
      const currentName = previous.category?.name ?? '-';
      const nextName = category?.name ?? '-';
      changes.push(`Categoria alterada: ${currentName} → ${nextName}`);
    }

    const nextResponsibleId = data.responsibleId ?? data.responsible?.id;
    if (
      nextResponsibleId &&
      previous.responsible?.id !== Number(nextResponsibleId)
    ) {
      const responsible = await this.userRepository.findOne({
        where: { id: Number(nextResponsibleId) },
      });
      const currentName = previous.responsible?.name ?? '-';
      const nextName = responsible?.name ?? '-';
      changes.push(`Responsável alterado: ${currentName} → ${nextName}`);
    }

    if (
      data.subject &&
      data.subject.trim() &&
      previous.subject !== data.subject.trim()
    ) {
      changes.push('Assunto alterado');
    }

    return changes.length ? changes.join(' | ') : null;
  }

  private normalizePriority(priority?: string): TicketPriority {
    const priorities = Object.values(TicketPriority);
    return (
      priority && priorities.includes(priority as TicketPriority)
        ? (priority as TicketPriority)
        : TicketPriority.MEDIA
    ) as TicketPriority;
  }

  private normalizeStatus(status?: string): TicketStatus {
    const statuses = Object.values(TicketStatus);
    return (
      status && statuses.includes(status as TicketStatus)
        ? (status as TicketStatus)
        : TicketStatus.ABERTO
    ) as TicketStatus;
  }
}
