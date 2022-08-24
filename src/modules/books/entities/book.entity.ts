import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'
import { Author } from 'src/modules/authors/entities/author.entity'
import { Editorial } from 'src/modules/editorials/entities/editorial.entity'
import { Tag } from 'src/modules/tags/entities/tag.entity'

@Schema()
export class Book {
    @Prop({ required: true, maxlength: 150 })
    name: string

    @Prop({ required: true, unique: true })
    slug: string

    @Prop({ required: true, maxlength: 500 })
    synopsis: string

    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: Tag.name }] })
    tags: Types.Array<Types.ObjectId> | Tag[]

    @Prop({ required: true, type: Types.ObjectId, ref: Author.name })
    author: Types.ObjectId | Author

    @Prop()
    ranking: number

    @Prop({ type: Types.ObjectId, ref: 'File', required: true })
    image: Types.ObjectId | FileDB

    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    book: Types.ObjectId | FileDB

    @Prop({ required: true, type: Types.ObjectId, ref: Editorial.name })
    editorial: Types.ObjectId | Editorial

    @Prop({ required: true })
    date_upload: Date

    @Prop({ required: true })
    date_update: Date
}

export const BookSchema = SchemaFactory.createForClass(Book)
