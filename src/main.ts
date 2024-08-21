import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Rawabi login system API')
    .setDescription('API documentation for regestration and login with JWT passport')
    .setVersion('1.0')
    .addTag('login')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('loginAPI', app, document, {
    swaggerOptions: {
        persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT);
}
bootstrap();
