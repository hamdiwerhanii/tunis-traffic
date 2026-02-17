import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Tunis Traffic API')
    .setDescription('API for Tunis Traffic Quick Check — Favorites & Search History')
    .setVersion('1.0')
    .addTag('Tunis Traffic')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
    origin: process.env.NEST_PUBLIC_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(cookieParser());

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  console.log('──────────────────────────────────────────────────');
  console.log(`🚦 Tunis Traffic API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/api`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`🌐 Frontend: ${process.env.NEST_PUBLIC_FRONTEND_URL}`);
  console.log('──────────────────────────────────────────────────');
}
bootstrap();
