import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword, IsEmail } from 'class-validator';

export class AuthUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
