import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import { getNatsServers } from 'src/utils/get_nats_servers'
import { AwsModule } from '../aws/aws.module'
import { BooksController } from './controller/books.controller'
import { Book, BookSchema } from './entities/book.entity'
import { RankBook, RankBookSchema } from './entities/rank_book.entity'
import { SaveBook, SaveBookSchema } from './entities/save_book.entity'
import { BooksService } from './service/books.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Book.name,
                schema: BookSchema,
            },
            {
                name: SaveBook.name,
                schema: SaveBookSchema,
            },
            {
                name: RankBook.name,
                schema: RankBookSchema,
            },
        ]),
        AwsModule,
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
    controllers: [BooksController],
    providers: [BooksService],
    exports: [BooksService],
})
export class BooksModule {}
