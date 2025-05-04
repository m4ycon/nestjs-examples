import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from '../../data-source';
import { PersistenceRepository } from './persistence.repository';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
  providers: [PersistenceRepository],
  exports: [PersistenceRepository],
})
export class RepositoriesModule {}
