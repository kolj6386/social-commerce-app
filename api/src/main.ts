import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'

async function bootstrap() {
  // Builds the app from app/module.ts
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Origin',
  })

  // Validates the request body using the class-validator and class-transformer
  // Whitelist: true - only allows properties that are defined in the DTO
  // Transform: true - transforms the request body to the DTO type
  // TransformOptions: { enableImplicitConversion: true } - enables implicit conversion of primitive types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Social Commerce API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('swagger', app, document)

  const port = parseInt(process.env.PORT ?? '5120', 10)
  app.set('trust proxy', true)
  await app.listen(port, '0.0.0.0')

  const baseUrl = `http://localhost:${port}`
  console.log(`API running at ${baseUrl}`)
  console.log(`Swagger UI at ${baseUrl}/swagger`)
}

bootstrap()
