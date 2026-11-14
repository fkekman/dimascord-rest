import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { ApplicationConfiguration } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const config = app.get(ConfigService<ApplicationConfiguration, true>);
  await app.listen(config.get('port', { infer: true }));
}
void bootstrap();
