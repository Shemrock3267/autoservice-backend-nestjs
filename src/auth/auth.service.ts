import {
  BadRequestException, ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { TokensDto } from './dto/tokens.dto.js';
import { HASH_NUMBER } from '../constants/index.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  #getExpiryDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);

    return now.toISOString();
  };

  async validateUser(email: string, password: string) {
    const existingUser = await this.usersService.findOneByEmail(email);

    if (!existingUser) {
      throw new NotFoundException(`User ${email} not found`);
    }

    if (await bcrypt.compare(password, existingUser.password)) {
      const { password, ...safeUser } = existingUser;

      return new User(safeUser);
    }
  }

  async login(user: User, isVerified: boolean) {
    const { password, ...safeUser } = user;

    const payload = {
      users_id: user.id,
      sub: {
        ...safeUser,
        isVerified,
      },
    };

    return new TokensDto({
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '1h',
        secret: `${process.env.JWT_SECRET}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '60d',
        secret: `${process.env.JWT_REFRESH_SECRET}`,
      }),
    });
  }

  async refreshToken(user: User, isVerified: boolean) {
    const { password, ...safeUser } = user;

    const payload = {
      users_id: user.id,
      sub: {
        ...safeUser,
        isVerified,
      },
    };

    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: `${process.env.JWT_SECRET}`,
    });
  }

  async forgotPassword(email: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (!existingUser) {
      throw new NotFoundException(`User ${email} not found`);
    }

    const randomId = crypto.randomUUID();

    await this.prisma.client.users.update({
      where: {
        id: existingUser.id,
      },
      data: {
        otp: randomId,
      },
    });

    return { id: randomId, user: existingUser };
  }

  async changePassword(userId: number, password: string) {
    await this.prisma.client.users.update({
      where: {
        id: userId,
      },
      data: {
        password: bcrypt.hash(password, HASH_NUMBER),
        otp: null,
      },
    });
  }

  async resetPassword(password: string, otp: string) {
    const existingUser = await this.prisma.client.users.findFirst({
      where: {
        otp,
      },
    });

    if (!existingUser || !otp) {
      throw new BadRequestException('Otp does not exist');
    }

    await this.changePassword(existingUser.id, password);

    return existingUser;
  }

  async getUserConfirmation(id: number, code?: string) {
    return this.prisma.client.verifications.findFirst({
      where: {
        users_id: id,
        ...(code && {
          AND: {
            verification_code: code,
          },
        }),
      },
    });
  }

  async confirmEmail(id: number, code: string) {
    const userRecord = await this.getUserConfirmation(id, code);

    if (!userRecord) {
      throw new BadRequestException('Otp does not exist');
    }

    if (userRecord.verified || userRecord.verified_at) {
      throw new ConflictException('User already verified');
    }

    if (userRecord.expires_at && new Date() > userRecord.expires_at) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.client.verifications.update({
      where: {
        verification_id: userRecord.verification_id,
      },
      data: {
        verified: true,
        verified_at: new Date().toISOString(),
      },
    });
  }

  async createEmailVerification(userId: number): Promise<string> {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiresAt = this.#getExpiryDate();

    await this.prisma.client.verifications.create({
      data: {
        users_id: userId,
        type: 'Email',
        verification_code: verificationCode,
        expires_at: expiresAt,
        verified: false,
      },
    });

    return verificationCode;
  }
}
