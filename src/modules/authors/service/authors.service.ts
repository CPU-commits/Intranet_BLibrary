import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectID } from 'bson'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import * as slug from 'slug'
import { FileDB } from 'src/models/file.model'
import { AwsService } from 'src/modules/aws/service/aws.service'
import { BooksService } from 'src/modules/books/service/books.service'
import { AuthorDTO, UpdateAuthorDTO } from '../dtos/author.dto'
import { Author } from '../entities/author.entity'

@Injectable()
export class AuthorsService {
    constructor(
        @InjectModel(Author.name) private readonly authorModel: Model<Author>,
        private readonly awsService: AwsService,
        private readonly booksService: BooksService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    async getAuthorById(idAuthor: string) {
        return await this.authorModel.findById(idAuthor).exec()
    }

    async getAuthorBySlug(slug: string) {
        const author = await this.authorModel
            .findOne({
                slug,
            })
            .populate('image', { key: 1 })
            .exec()
        if (!author) throw new NotFoundException('No se ha encontrado al autor')
        const image = author.image as FileDB
        const imageUrl: Array<string> = await lastValueFrom(
            this.natsClient.send('get_aws_token_access', [image.key]),
        )
        author.image = {
            url: imageUrl[0],
        } as FileDB
        return author
    }

    async getAuthors() {
        return await this.authorModel
            .find(
                { status: true },
                { name: 1, slug: 1, date_upload: 1, date_update: 1 },
            )
            .sort({ name: 1 })
            .exec()
    }

    async uploadAuthor(author: AuthorDTO, image: Express.Multer.File) {
        const fileDB = await this.awsService.uploadFileToDB(image, 'authors')
        const now = new Date()
        const newAuthor = new this.authorModel({
            ...author,
            slug: slug(author.name),
            image: fileDB._id.$oid,
            table_info: author.table_info.map((item) => {
                return {
                    ...item,
                    _id: new ObjectID(),
                }
            }),
            fun_facts: author.fun_facts.map((fact) => {
                return {
                    ...fact,
                    _id: new ObjectID(),
                }
            }),
            date_upload: now,
            date_update: now,
        })
        return await newAuthor.save()
    }

    async updateAuthor(
        author: UpdateAuthorDTO,
        image: Express.Multer.File,
        idAuthor: string,
    ) {
        const authorData = await this.getAuthorById(idAuthor)
        if (!authorData) throw new NotFoundException('El autor no existe')
        let fileDB: FileDB
        if (image) {
            fileDB = await this.awsService.uploadFileToDB(image, 'authors')
            this.natsClient.emit('delete_files', [authorData.image])
        }
        await this.authorModel
            .findByIdAndUpdate(
                idAuthor,
                {
                    $set: {
                        ...author,
                        table_info: author?.table_info?.map((item) => {
                            return {
                                ...item,
                                _id: new ObjectID(),
                            }
                        }),
                        fun_facts: author?.fun_facts?.map((fact) => {
                            return {
                                ...fact,
                                _id: new ObjectID(),
                            }
                        }),
                        image: fileDB ? fileDB._id.$oid : undefined,
                    },
                },
                { new: true },
            )
            .exec()
    }

    async deleteAuthor(idAuthor: string) {
        const authorData = await this.getAuthorById(idAuthor)
        if (!authorData) throw new NotFoundException('No existe el autor')
        const hasAuthor = await this.booksService.bookHasAuthor(idAuthor)
        if (hasAuthor) {
            this.natsClient.emit('delete_files', [authorData.image])
            return await this.authorModel
                .findByIdAndUpdate(
                    idAuthor,
                    {
                        $set: {
                            status: false,
                        },
                    },
                    { new: true },
                )
                .exec()
        } else {
            return await this.authorModel.findByIdAndDelete(idAuthor)
        }
    }
}
