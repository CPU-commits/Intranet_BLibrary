import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as slug from 'slug'
import { BooksService } from 'src/modules/books/service/books.service'
import { TagDTO } from '../dtos/tag.dto'
import { Tag } from '../entities/tag.entity'

@Injectable()
export class TagsService {
    constructor(
        @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
        private readonly booksService: BooksService,
    ) {}

    async getTagById(idTag: string) {
        return await this.tagModel.findById(idTag).exec()
    }

    async getTags() {
        return await this.tagModel
            .find({ status: true })
            .sort({ tag: 1 })
            .exec()
    }

    async newTag(tag: TagDTO) {
        const newTag = new this.tagModel({
            tag: tag.tag,
            slug: slug(tag.tag),
            date: new Date(),
        })
        return await newTag.save()
    }

    async deleteTag(idTag: string) {
        const tagData = await this.getTagById(idTag)
        if (!tagData) throw new NotFoundException('No existe el tag')
        const bookHasTag = await this.booksService.bookHasTag(idTag)
        if (bookHasTag) {
            return await this.tagModel
                .findByIdAndUpdate(
                    idTag,
                    {
                        $set: {
                            status: false,
                        },
                    },
                    { new: true },
                )
                .exec()
        } else {
            return await this.tagModel.findByIdAndDelete(idTag)
        }
    }
}
