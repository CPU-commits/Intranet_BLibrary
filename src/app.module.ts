import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { TagsModule } from './modules/tags/tags.module'
import { AuthorsModule } from './modules/authors/authors.module'
import { BooksModule } from './modules/books/books.module'
import { ConfigModule } from '@nestjs/config'
import { EditorialsModule } from './modules/editorials/editorials.module'
import * as Joi from 'joi'

import config from './config'
import { AwsModule } from './modules/aws/aws.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

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
                ELASTICSEARCH_NODE: Joi.string().required(),
                CLIENT_URL: Joi.string().required(),
            }),
        }),
        EditorialsModule,
        AwsModule,
        ThrottlerModule.forRoot({
            ttl: 1,
            limit: 7,
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
