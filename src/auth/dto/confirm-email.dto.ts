import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';


export class ConfirmEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 32)
  code: string;
}
