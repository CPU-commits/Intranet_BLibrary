import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import config from 'src/config'
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
    providers: [AwsService],
    exports: [AwsService],
})
export class AwsModule {}
