import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

export interface TicketListQuery {
  subject?: string;
  requester?: string;
  categoryId?: string;
  priority?: string;
  status?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() body: CreateTicketDto, @Request() req: any) {
    return this.ticketsService.create({ ...body, userId: req.user?.id });
  }

  @Get()
  findAll(@Query() query: TicketListQuery) {
    return this.ticketsService.findAll(query);
  }

  @Get('dashboard')
  dashboardSummary() {
    return this.ticketsService.getDashboardSummary();
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.ticketsService.createComment(Number(id), {
      text: body.text,
      userId: req.user?.id,
    });
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.ticketsService.getComments(Number(id));
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.ticketsService.getHistory(Number(id));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.update(Number(id), {
      ...body,
      userId: req.user?.id,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(Number(id));
  }
}
