import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';

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

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() body: any) {
    return this.ticketsService.create(body);
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
    @Body() body: { text: string; userId?: number },
  ) {
    return this.ticketsService.createComment(Number(id), body);
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
  update(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(Number(id));
  }
}
