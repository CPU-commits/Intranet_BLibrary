import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'
import { Author } from 'src/modules/authors/entities/author.entity'
import { Editorial } from 'src/modules/editorials/entities/editorial.entity'
import { Tag } from 'src/modules/tags/entities/tag.entity'

@Schema()
export class Book {
    @ApiProperty({
        example: '1984',
    })
    @Prop({ required: true, maxlength: 150 })
    name: string

    @ApiProperty({
        example: '1984',
    })
    @Prop({ required: true, unique: true })
    slug: string

    @ApiProperty({
        example: `Nineteen Eighty-Four (also stylised as 1984) is a
            dystopian social science fiction novel and cautionary tale written
            by the English writer George Orwell.`,
    })
    @Prop({ required: true, maxlength: 500 })
    synopsis: string

    @ApiExtraModels()
    @ApiProperty({
        oneOf: [
            { type: 'array', items: { type: 'string' } },
            { type: 'array', items: { $ref: getSchemaPath(Tag) } },
        ],
    })
    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: Tag.name }] })
    tags: Types.Array<Types.ObjectId> | Tag[]

    @ApiExtraModels(Author)
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Author) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Author.name })
    author: Types.ObjectId | Author

    @ApiProperty({
        enum: [1, 2, 3, 4, 5],
        example: 4,
    })
    @Prop()
    ranking: number

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(FileDB) }],
    })
    @Prop({ type: Types.ObjectId, ref: 'File', required: true })
    image: Types.ObjectId | FileDB

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(FileDB) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    book: Types.ObjectId | FileDB

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Editorial) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Editorial.name })
    editorial: Types.ObjectId | Editorial

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true })
    date_upload: Date

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true })
    date_update: Date
}

export const BookSchema = SchemaFactory.createForClass(Book)
