import { Inject, Injectable } from '@nestjs/common';
import PgBoss from 'pg-boss';

@Injectable()
export class PgBossService {
  constructor(@Inject('PG_BOSS') private readonly boss: PgBoss) {}

  async onModuleInit() {
    await this.boss.start();
  }

  async createJob<T extends Record<string, any>>(
    queue: string,
    data: T,
  ): Promise<string | null> {
    return await this.boss.send(queue, data);
  }

  async registerJobHandler(
    queue: string,
    handler: (job: any) => Promise<void>,
  ): Promise<void> {
    await this.boss.work(queue, handler);
  }
}
