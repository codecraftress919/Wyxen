import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ApiResponseInterceptor } from './common/api-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3000'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  const configuredPort = Number(process.env.PORT ?? 3001);

  if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  await app.listen(configuredPort);
}
await bootstrap();
