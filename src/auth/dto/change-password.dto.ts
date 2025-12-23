import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  repeatPassword: string;
}
