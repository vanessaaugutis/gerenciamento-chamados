import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Comment } from './entities/CommentEntity';
import { Category } from './entities/CategorieEntity';
import { History } from './entities/HistoryEntity';
import { Ticket } from './entities/TicketEntity';
import { User } from './entities/UserEntity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'gerenciamento_chamados',
  entities: [User, Category, Ticket, Comment, History],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};
