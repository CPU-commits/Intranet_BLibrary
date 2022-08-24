import {
    BadRequestException,
    Inject,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { S3 } from 'aws-sdk'
import { Error } from 'aws-sdk/clients/s3'
import { v4 as uuidv4 } from 'uuid'
import { lastValueFrom } from 'rxjs'
import config from 'src/config'
import { FileDB } from 'src/models/file.model'

@Injectable()
export class AwsService {
    private s3 = new S3()

    constructor(
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    async uploadFileAWS(
        file: Buffer,
        Key: string,
    ): Promise<S3.ManagedUpload.SendData> {
        const params = {
            Bucket: this.configService.aws.bucket,
            Key,
            Body: file,
        }
        const fileUploaded = await this.s3
            .upload(params)
            .promise()
            .then((data) => {
                return data
            })
            .catch((error: Error) => {
                throw new BadRequestException(error.Message)
            })
        return fileUploaded
    }

    async uploadFileToDB(file: Express.Multer.File, extraKey: string) {
        const ext = file.originalname.split('.')
        const fileUploaded = await this.uploadFileAWS(
            file.buffer,
            `${extraKey}/${uuidv4()}.${ext[ext.length - 1]}`,
        )
        let fileDB: FileDB
        try {
            fileDB = await lastValueFrom(
                this.natsClient.send('upload_image', fileUploaded.Key),
            )
        } catch (err) {
            this.natsClient.emit('delete_file_aws', fileUploaded.Key)
            throw new ServiceUnavailableException('Servicio no disponible')
        }
        return fileDB
    }

    async deleteFileAWS(Key: string) {
        const params = {
            Bucket: this.configService.aws.bucket,
            Key,
        }
        const fileDeleted = await this.s3
            .deleteObject(params)
            .promise()
            .then((data) => {
                return data
            })
            .catch((error: Error) => {
                throw new BadRequestException(error.Message)
            })
        return fileDeleted
    }
}
