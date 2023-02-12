import { Module } from '@nestjs/common'
import { EditorialsService } from './service/editorials.service'
import { EditorialsController } from './controller/editorials.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Editorial, EditorialSchema } from './entities/editorial.entity'
import { AwsModule } from '../aws/aws.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { BooksModule } from '../books/books.module'
import { getNatsServers } from 'src/utils/get_nats_servers'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Editorial.name,
                schema: EditorialSchema,
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
    providers: [EditorialsService],
    controllers: [EditorialsController],
})
export class EditorialsModule {}
