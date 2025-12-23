import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigModule } from '@nestjs/config';
import process from 'process';

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
  providers: [AuthService],
})
export class AuthModule {}
