import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../../entities/TicketEntity';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subject?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requesterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  responsibleId?: number;
}
