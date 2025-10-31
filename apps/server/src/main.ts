import $RefParser from '@apidevtools/json-schema-ref-parser'
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { ValidationError } from 'class-validator'
import compression from 'compression'
import * as express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { NgOpenApiGen } from 'ng-openapi-gen'
import { Options } from 'ng-openapi-gen/lib/options'
import { join } from 'path'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  })
  const logger = new Logger(`${process.env.SERVICE_NAME} Server`)

  /** CORS */
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202'],
    credentials: true,
    maxAge: 86400
  })

  /** Disable ETag */
  app.disable('etag')

  app.use(express.json({ limit: '500mb' }))
  app.useBodyParser('json', { limit: '100mb' })
  app.useBodyParser('urlencoded', { limit: '100mb', extended: true })

  app.enableShutdownHooks()

  /** Security */
  app.use(
    helmet({
      /** CSP */
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, 'https:', 'src', `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`]
        }
      }
    })
  )

  /** Compression */
  app.use(compression())

  /** Morgan */
  app.use(morgan('dev'))

  /** Versioning */
  app.enableVersioning()

  /** Static Assets */
  app.useStaticAssets(join(__dirname, 'assets'), {
    setHeaders: (res, path) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'cross-origin')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    }
  })

  /** Global Valdation Pipe */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const extractMessage = (error: ValidationError): string | null => {
          if (error.children && error.children.length > 0) {
            return extractMessage(error.children[0])
          }

          const constraints = error.constraints
          if (constraints) {
            const keys = Object.keys(constraints)
            const lastKey = keys[keys.length - 1]
            return constraints[lastKey]
          }

          return null
        }

        const message = errors.length > 0 ? extractMessage(errors[0]) : 'Validation failed'
        return new BadRequestException(message || 'Validation failed')
      }
    })
  )

  /** Swagger */
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${process.env.SERVICE_NAME} API`)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'x-access-token',
          description: 'Enter Access token',
          in: 'header'
        },
        'x-access-token'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-refresh-token',
          in: 'header'
        },
        'x-refresh-token'
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'session'
        },
        'cookie'
      )
      .addServer(process.env.BASE_URL)
      .build(),
    {}
  )

  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document
      }
    })
  )

  if (process.env.NODE_ENV !== 'production') {
    generateApiClient(document as OpenAPIObject).then(() => {
      logger.log('API Client Generated')
    })
  }

  process.on('SIGINT', async () => {
    await app.close()
    process.exit(0)
  })

  await app.listen(3000, () => {
    logger.log(`🚀 ${process.env.SERVICE_NAME} 메인 서버가 구동되었습니다. (포트: 3000)`)
  })
}

bootstrap()

const generateApiClient = async (document: OpenAPIObject) => {
  const options: Options = {
    input: JSON.parse(JSON.stringify(document)),
    output: 'libs/api-client/src/lib',
    indexFile: true,
    silent: true
  }

  const RefParser = new $RefParser()
  const openApi = await RefParser.bundle(options.input, {
    dereference: { circular: false }
  })

  const ngOpenGen = new NgOpenApiGen(openApi, options)
  ngOpenGen.generate()
}
