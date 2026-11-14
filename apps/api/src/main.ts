import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './infrastructure/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Global exception filter for unified error formats
  app.useGlobalFilters(new AllExceptionsFilter());

  // HttpOnly cookie parsing
  app.use(cookieParser());

  // CORS configuration
  const clientUrl = process.env.CLIENT_URL || 'http://localhost';
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`tPomodoro API running on: http://localhost:${port}/api`);
}
bootstrap();
