import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'daemon' ? '.env.daemon' : '.env.dev';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global prefix '/api' to all routes
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Rawabi login system API')
    .setDescription(
      'API documentation for registration and login with JWT passport',
    )
    .setVersion('1.0')
    .addTag('login')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-auth',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/loginAPI', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Listen on the port defined in the loaded environment file
  await app.listen(process.env.PORT);

  // Configure logging based on the environment
  if (process.env.NODE_ENV === 'daemon') {
    const logDir = '/logDirBE';
    const logFile = 'logfile.log';
    const logPath = path.join(logDir, logFile);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    app.useLogger(new Logger());

    // Redirect console logs to the log file
    console.log = (...args) => logStream.write(args.join(' ') + '\n');
  } else {
    app.useLogger(['log', 'error', 'warn']);
  }
}

bootstrap();
