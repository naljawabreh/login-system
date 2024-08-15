import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Costt login system API')
    .setDescription('API documentation for regestration and login with JWT passport')
    .setVersion('1.0')
    .addTag('login')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('loginAPI', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
