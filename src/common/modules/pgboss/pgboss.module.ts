import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import PgBoss from 'pg-boss';

@Global()
@Module({})
export class PgBossModule {
  static forRoot(): DynamicModule {
    const pgBossProvider = {
      provide: 'PG_BOSS',
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const boss = new PgBoss(connectionString as string);

        await boss.start();

        return boss;
      },
      inject: [ConfigService],
    };

    return {
      module: PgBossModule,
      imports: [ConfigModule],
      providers: [pgBossProvider],
      exports: [pgBossProvider],
    };
  }
}
