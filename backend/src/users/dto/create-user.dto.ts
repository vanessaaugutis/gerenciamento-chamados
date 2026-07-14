import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
