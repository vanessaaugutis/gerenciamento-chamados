import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { jwtConstants } from './auth.constants';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Response({ passthrough: true }) response: ExpressResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.usersService.validateUser(loginUserDto);
    this.setRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Request() request: ExpressRequest) {
    const refreshToken = this.getCookie(request, 'refreshToken');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente.');
    }

    const token = await this.usersService.refreshAccessToken(refreshToken);
    return token;
  }

  @Post('logout')
  logout(@Response({ passthrough: true }) response: ExpressResponse) {
    response.clearCookie('refreshToken', { path: '/users' });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  private setRefreshTokenCookie(response: ExpressResponse, token: string) {
    response.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: jwtConstants.refreshTokenMaxAge,
      path: '/users',
    });
  }

  private getCookie(request: ExpressRequest, name: string): string | undefined {
    const prefix = `${name}=`;
    const value = request.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix));

    return value ? decodeURIComponent(value.slice(prefix.length)) : undefined;
  }
}
