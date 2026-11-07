import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const configuredPort = Number(process.env.PORT ?? 3001);

  if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  await app.listen(configuredPort);
}
await bootstrap();
