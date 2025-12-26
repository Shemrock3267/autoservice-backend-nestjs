import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import process from 'process';
import { UsersService } from '../users/users.service.js';
import { LocalStrategy } from './strategies/local-strategy.js';
import { JwtStrategy } from './strategies/jwt-strategy.js';
import { JwtNotVerifiedStrategy } from './strategies/jwt-not-verified-strategy.js';
import { RefreshJwtStrategy } from './strategies/refresh-token.strategy.js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

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
