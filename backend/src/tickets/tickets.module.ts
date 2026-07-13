import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/CategorieEntity';
import { Comment } from '../entities/CommentEntity';
import { History } from '../entities/HistoryEntity';
import { Ticket } from '../entities/TicketEntity';
import { User } from '../entities/UserEntity';
import { UsersModule } from '../users/users.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Category, User, Comment, History]),
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
