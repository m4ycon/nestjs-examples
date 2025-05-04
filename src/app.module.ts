import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { TypedConfigModule } from './modules/config/typed-config.module';
import { RepositoriesModule } from './repositories/repositories.modules';

@Module({
  imports: [RepositoriesModule, TypedConfigModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
