/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';



async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());

	app.use(cookieParser());

	const config = new DocumentBuilder()
	  .setTitle('ft_transcendence backend API')
	  .setDescription('The last common core project of 42. This is the backend which is used by the frontend to communicate with the database.')
	  .setVersion('1.0')
	  .addTag('NestJS')
	  .build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('', app, document);

	app.enableCors({
		origin: [
			"http://" + "f1r3s17" + ":3006",
			"http://" + "f1r3s17" + ":3000",
		],
		credentials: true,
		exposedHeaders: ['randomStringLol', 'X-XSRF-TOKEN', "Authorization"],
	});

	await app.listen(3000);
}
bootstrap();
