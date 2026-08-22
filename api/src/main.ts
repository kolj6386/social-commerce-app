import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { NotFoundExceptionFilter } from './common/filters/not-found.filter'
import { CorsOriginsService } from './cors/cors-origins.service'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  // Builds the app from app/module.ts
  // rawBody: true exposes req.rawBody so webhook HMAC can be verified against the exact payload.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  app.useGlobalFilters(new NotFoundExceptionFilter())

  await app.init()

  const corsOrigins = app.get(CorsOriginsService)
  app.enableCors({
    origin: (origin, callback) => {
      if (corsOrigins.isAllowed(origin)) {
        callback(null, true)
        return
      }

      logger.warn(`CORS blocked origin: ${origin ?? '(none)'}`)
      callback(null, false)
    },
    credentials: true,
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

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production'

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Social Commerce API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('swagger', app, document)
  }

  const port = parseInt(process.env.PORT ?? '5120', 10)
  app.set('trust proxy', true)
  await app.listen(port, '0.0.0.0')

  console.log(`API running on 0.0.0.0:${port}`)
  if (enableSwagger) {
    console.log(`Swagger UI at /swagger`)
  }
}

void bootstrap()
