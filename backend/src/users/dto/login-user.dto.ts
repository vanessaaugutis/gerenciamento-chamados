import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
