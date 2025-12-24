import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import process from 'process';
import { UsersService } from '../users/users.service';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtNotVerifiedStrategy } from './strategies/jwt-not-verified-strategy';
import { RefreshJwtStrategy } from './strategies/refresh-token.strategy';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_ADMIN = {
  email: `${process.env.ADMIN_NAME}`,
  password: `${process.env.ADMIN_PASS}`,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    JwtNotVerifiedStrategy,
    RefreshJwtStrategy,
    JwtService,
    PrismaService,
    ConfigService,
    // PgBossService,
    // EmailService,
    // SparkPostService,
  ],
})
export class AuthModule {}
