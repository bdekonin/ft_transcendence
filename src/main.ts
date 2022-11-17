import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.use(session({
      secret: "randomStringLol",
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 600000, // 10 minutes
      }
    })
  );

  // app.setGlobalPrefix("api/v2");

  const config = new DocumentBuilder()
    .setTitle('ft_transcendence backend API')
    .setDescription('The last common core project of 42. This is the backend which is used by the frontend to communicate with the database.')
    .setVersion('1.0')
    .addTag('NestJS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
