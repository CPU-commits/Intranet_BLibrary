import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import { getNatsServers } from 'src/utils/get_nats_servers'
import { SchemaFile, File } from './entities/file.entity'
import { AwsService } from './service/aws.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: File.name,
                schema: SchemaFile,
            },
        ]),
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
    providers: [AwsService],
    exports: [AwsService],
})
export class AwsModule {}
