import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
    const absoluteDbPath = path.resolve(process.cwd(), dbPath);

    const adapter = new PrismaLibSql({
      url: `file:${absoluteDbPath}`,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
