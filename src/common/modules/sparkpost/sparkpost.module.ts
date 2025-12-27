import { Module } from '@nestjs/common';
import { SparkpostService } from './sparkpost.service.js';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [SparkpostService, ConfigService],
  exports: [SparkpostService],
})
export class SparkpostModule {}
