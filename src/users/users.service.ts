import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { HASH_NUMBER } from '../constants/index.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.client.users.findFirst({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('user already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      HASH_NUMBER,
    );

    const user = await this.prisma.client.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...safeUser } = user;

    return safeUser;
  }

  findOne(id: number) {
    return this.prisma.client.users.findUnique({
      where: { id },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.client.users.findFirst({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.client.users.findFirst({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id #${id} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hash(updateUserDto.password, HASH_NUMBER);
    }

    return this.prisma.client.users.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const existingUser = await this.prisma.client.users.findFirst({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id #${id} not found`);
    }

    return this.prisma.client.users.delete({ where: { id } });
  }
}
