import { Module } from '@nestjs/common'
import { EditorialsService } from './service/editorials.service'
import { EditorialsController } from './controller/editorials.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Editorial, EditorialSchema } from './entities/editorial.entity'
import { AwsModule } from '../aws/aws.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { BooksModule } from '../books/books.module'

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
    providers: [EditorialsService],
    controllers: [EditorialsController],
})
export class EditorialsModule {}
