import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { TypedConfigModule } from './modules/config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
