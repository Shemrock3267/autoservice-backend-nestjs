import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SparkpostModule } from './common/modules/sparkpost/sparkpost.module.js';
import { EmailService } from './email/email.service.js';
import { PgBossService } from './common/modules/pgboss/pgboss.service.js';
import { PgBossModule } from './common/modules/pgboss/pgboss.module.js';
import { AuthService } from './auth/auth.service.js';
import { UsersService } from './users/users.service.js';
import { SparkpostService } from './common/modules/sparkpost/sparkpost.service.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    SparkpostModule,
    PgBossModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    UsersService,
    JwtService,
    PgBossService,
    EmailService,
    SparkpostService,
  ],
})
export class AppModule {}
