import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
  LogLevel,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { LocationSeed } from './location/seeds/location.seed';

async function bootstrap() {
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  // Configure logger levels based on environment
  const logLevels: LogLevel[] = isTestEnvironment
    ? ['warn'] // Only show warnings in test environment
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    cors: true,
    // logger: logLevels,
    // Optionally disable logger completely in test environment
    logger: isTestEnvironment ? false : logLevels,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Only set up Swagger in non-test environment
  if (!isTestEnvironment) {
    const options = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(
      app as INestApplication,
      options,
    );
    SwaggerModule.setup('docs', app as INestApplication, document);
  }

  // Only seed data in non-test environment
  if (!isTestEnvironment) {
    const locationSeed = app.get(LocationSeed);
    await locationSeed.run();
  }

  await app.listen(3000);
  if (!isTestEnvironment) {
    logger.log('Application listening on port 3000');
  }
}
bootstrap();
