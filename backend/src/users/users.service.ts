import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/UserEntity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      throw new BadRequestException('Nome, e-mail e senha são obrigatórios.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      name: name.trim(),
      email: email.trim(),
      password: passwordHash,
    });
    return this.usersRepository.save(user);
  }

  async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não cadastrado.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async findAll(): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
    const users = await this.usersRepository.find({ order: { name: 'ASC' } });
    return users.map(({ id, name, email }) => ({ id, name, email }));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    return user;
  }
}
