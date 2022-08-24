import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import config from 'src/config'

import { AwsModule } from '../aws/aws.module'
import { BooksModule } from '../books/books.module'
import { AuthorsController } from './controller/authors.controller'
import { Author, AuthorSchema } from './entities/author.entity'
import { AuthorsService } from './service/authors.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Author.name,
                schema: AuthorSchema,
            },
        ]),
        AwsModule,
        BooksModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
    ],
    controllers: [AuthorsController],
    providers: [AuthorsService],
})
export class AuthorsModule {}
