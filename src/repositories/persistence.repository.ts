import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PersistenceRepository {
  constructor(private readonly dataSource: DataSource) {}

  async transaction(cb: (entityManager: EntityManager) => Promise<void>) {
    return await this.dataSource.transaction(cb);
  }
}
