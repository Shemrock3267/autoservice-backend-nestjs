import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';


export class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  username: string;

  @Exclude()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ nullable: true })
  created_date: Date;

  constructor(partial) {
    Object.assign(this, partial);
  }
}
