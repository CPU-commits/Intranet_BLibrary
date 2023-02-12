import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import helmet from 'helmet'
import { AppModule } from './app.module'
import config from './config'
// import * as csurf from 'csurf'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ResApi } from './models/res.model'
import { FileDB } from './models/file.model'
import { Tag } from './modules/tags/entities/tag.entity'
import { Editorial } from './modules/editorials/entities/editorial.entity'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { getNatsServers } from './utils/get_nats_servers'

async function bootstrap() {
    // Config
    const configService = config()
    // App
    const app = await NestFactory.create(AppModule)
    // Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    // NATS Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: getNatsServers(),
            queue: 'library',
        },
    })
    await app.startAllMicroservices()
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    )
    const httpClient = `http://${configService.client_url}`
    const httpsClient = `https://${configService.client_url}`
    app.enableCors({
        origin: [httpClient, httpsClient],
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        credentials: true,
        allowedHeaders: '*',
    })
    // Helmet
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    )
    // Swagger
    const configDocs = new DocumentBuilder()
        .setTitle('Library API')
        .setVersion('1.0')
        .setDescription('API Server For library service')
        .setTermsOfService('http://swagger.io/terms/')
        .setContact(
            'API Support',
            'http://www.swagger.io/support',
            'support@swagger.io',
        )
        .setLicense(
            'Apache 2.0',
            'http://www.apache.org/licenses/LICENSE-2.0.html',
        )
        .setBasePath('/api/l')
        .addServer('http://localhost:3000')
        .addTag('Library', 'Library Service')
        .addTag('Authors')
        .addTag('Books')
        .addTag('Tags')
        .addTag('Editorials')
        .addTag('roles.directive')
        .addBearerAuth()
        .build()
    const docuement = SwaggerModule.createDocument(app, configDocs, {
        extraModels: [ResApi, FileDB, Tag, Editorial],
    })
    SwaggerModule.setup('/api/l/docs', app, docuement)

    // Csurf
    // app.use(csurf())
    await app.listen(3000)
}
bootstrap()
