import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  loadConfiguration,
  type ApplicationConfiguration,
} from '../configuration';
import { databaseOptions } from './database.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [loadConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ApplicationConfiguration, true>) => ({
        ...databaseOptions({
          port: config.get('port', { infer: true }),
          database: config.get('database', { infer: true }),
        }),
        retryAttempts: 1,
      }),
    }),
  ],
})
export class DatabaseModule {}
