import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './ormconfig';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    CategoriesModule,
    TicketsModule,
  ],
})
export class AppModule {}
