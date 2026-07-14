import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.FRONTEND_URL
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV === 'production' && !allowedOrigins?.length) {
    throw new Error('FRONTEND_URL é obrigatório em produção.');
  }
  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
