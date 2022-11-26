import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { AwsService } from 'src/modules/aws/service/aws.service'
import { EditorialDTO, UpdateEditorialDTO } from '../dtos/editorial.dto'
import { Editorial } from '../entities/editorial.entity'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { FileDB } from 'src/models/file.model'
import * as slug from 'slug'
import { BooksService } from 'src/modules/books/service/books.service'

@Injectable()
export class EditorialsService {
    constructor(
        @InjectModel(Editorial.name)
        private readonly editorialModel: Model<Editorial>,
        private readonly awsService: AwsService,
        private readonly booksService: BooksService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    async getEditorialById(idEditorial: string) {
        return await this.editorialModel.findById(idEditorial).exec()
    }

    async getEditorials() {
        const editorials = await this.editorialModel
            .find({ status: true })
            .sort({ editorial: 1 })
            .populate('image', { key: 1 })
            .exec()
        const imagesUrls: Array<string> = await lastValueFrom(
            this.natsClient.send(
                'get_aws_token_access',
                editorials.map((editorial) => {
                    const file = editorial.image as FileDB
                    return file.key
                }),
            ),
        )
        imagesUrls.forEach((image, i) => {
            editorials[i].image = {
                url: image,
            } as FileDB
        })
        return editorials
    }

    async uploadEditorial(editorial: EditorialDTO, image: Express.Multer.File) {
        const fileDB = await this.awsService.uploadFileToDB(image, 'editorials')
        const newEditorial = new this.editorialModel({
            editorial: editorial.editorial,
            image: fileDB._id.$oid,
            date: new Date(),
            slug: slug(editorial.editorial),
        })
        const saveEditorial = await newEditorial.save()
        const imageUrl = await lastValueFrom(
            this.natsClient.send('get_aws_token_access', [fileDB.key]),
        )
        return {
            editorial: editorial.editorial,
            date: saveEditorial.date,
            image: {
                url: imageUrl[0],
            },
            _id: saveEditorial._id,
        }
    }

    async updateEditorial(
        idEditorial: string,
        editorial?: UpdateEditorialDTO,
        image?: Express.Multer.File,
    ) {
        const editorialData = await this.getEditorialById(idEditorial)
        if (!editorialData)
            throw new NotFoundException('No existe la editorial')
        let fileDB: FileDB
        if (image)
            fileDB = await this.awsService.uploadFileToDB(image, 'editorials')
        await this.editorialModel
            .findByIdAndUpdate(
                idEditorial,
                {
                    $set: {
                        editorial: editorial?.editorial,
                        slug: slug(editorial?.editorial),
                        image: image ? fileDB._id.$oid : undefined,
                    },
                },
                { new: true },
            )
            .exec()
        if (image) {
            this.natsClient.emit('delete_files', [editorialData.image])
            const imageUrl: Array<string> = await lastValueFrom(
                this.natsClient.send('get_aws_token_access', [fileDB.key]),
            )
            return imageUrl[0]
        }
        return ''
    }

    async deleteEditorial(idEditorial: string) {
        const editorialData = await this.getEditorialById(idEditorial)
        if (!editorialData)
            throw new NotFoundException('No existe la editorial')
        const hasEditorial = await this.booksService.bookHasEditorial(
            idEditorial,
        )
        if (hasEditorial) {
            this.natsClient.emit('delete_files', [editorialData.image])
            return this.editorialModel
                .findByIdAndUpdate(
                    idEditorial,
                    {
                        $set: {
                            status: false,
                        },
                    },
                    { new: true },
                )
                .exec()
        } else {
            return this.editorialModel.findByIdAndRemove(idEditorial)
        }
    }
}
