import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const operationIdFactory = (controllerKey: string, methodKey: string) =>
  `${methodKey}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      whitelist: true, // Strip out properties that should not be received by the method handler
      forbidNonWhitelisted: true, // Throw errors when non-whitelisted values are provided
    }),
  );

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('KCB')
    .setDescription('The KCB API description')
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory,
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 5353);
}
bootstrap();
