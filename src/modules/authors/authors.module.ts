import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import { getNatsServers } from 'src/utils/get_nats_servers'

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
                useFactory: () => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: getNatsServers(),
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
