import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENVIRONMENT_VARIABLES } from 'src/core/model';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(readonly _configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: _configService.get(ENVIRONMENT_VARIABLES.DATABASE_URL),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
