import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Comment } from './entities/CommentEntity';
import { Category } from './entities/CategorieEntity';
import { History } from './entities/HistoryEntity';
import { Ticket } from './entities/TicketEntity';
import { User } from './entities/UserEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'gerenciamento_chamados',
  entities: [User, Category, Ticket, Comment, History],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
