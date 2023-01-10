import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { TagsModule } from './modules/tags/tags.module'
import { AuthorsModule } from './modules/authors/authors.module'
import { BooksModule } from './modules/books/books.module'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { EditorialsModule } from './modules/editorials/editorials.module'
import * as Joi from 'joi'

import config from './config'
import { AwsModule } from './modules/aws/aws.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { MainController } from './main/main.controller'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { CorrelationIdMiddleware } from './correlation-id.middleware'

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
        TagsModule,
        AuthorsModule,
        BooksModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
            load: [config],
            isGlobal: true,
            validationSchema: Joi.object({
                JWT_SECRET_KEY: Joi.string().required(),
                MONGO_DB: Joi.string().required(),
                MONGO_ROOT_USERNAME: Joi.string().required(),
                MONGO_ROOT_PASSWORD: Joi.string().required(),
                MONGO_PORT: Joi.number().required(),
                MONGO_HOST: Joi.string().required(),
                MONGO_CONNECTION: Joi.string().required(),
                NODE_ENV: Joi.string().required(),
                NATS_HOST: Joi.string().required(),
                AWS_BUCKET: Joi.string().required(),
                AWS_ACCESS_KEY_ID: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
                CLIENT_URL: Joi.string().required(),
            }),
        }),
        EditorialsModule,
        AwsModule,
        ThrottlerModule.forRoot({
            ttl: 1,
            limit: 7,
        }),
        WinstonModule.forRootAsync({
            useFactory: (configService: ConfigType<typeof config>) => {
                const { timestamp, json, combine, simple } = winston.format
                const transports: Array<winston.transport> = [
                    new winston.transports.File({
                        filename: 'error.log',
                        level: 'error',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 2,
                    }),
                    new winston.transports.File({
                        filename: 'combined.log',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 3,
                        level: 'info',
                        format: combine(json(), timestamp()),
                    }),
                ]
                if (configService.node_env !== 'prod')
                    transports.push(
                        new winston.transports.Console({
                            format: combine(simple(), timestamp()),
                        }),
                    )
                return {
                    transports,
                    format: combine(timestamp(), json()),
                }
            },
            inject: [config.KEY],
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    controllers: [MainController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CorrelationIdMiddleware).forRoutes('*')
    }
}
