import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( 
    new ValidationPipe({
    whitelist: true,
    // forbidNonWhitelisted: true,//Se comenta para que pueda aceptar varios args, bloquea que borbanden con mucha informacion que no se necesita
    })
  );
  await app.listen(3050);
}
bootstrap();
