import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './modules/app.module';
import { Envs } from './common/envs/envs';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      validateCustomDecorators: true,
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: {
        target: true,
        value: true,
      },
    }),
  );
  // await useKafka(app);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(Envs.app.appPort);
}

void bootstrap();
