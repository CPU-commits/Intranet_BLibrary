import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'

export class TableInfo {
    @ApiProperty({
        type: String,
        example: '63816d20d8c6d89796a4c483',
    })
    _id: Types.ObjectId

    @ApiProperty({
        example: 'Age',
    })
    key: string

    @ApiProperty({
        example: '18',
    })
    value: string
}

export class FunFacts {
    @ApiProperty({
        type: String,
        example: '63816d20d8c6d89796a4c483',
    })
    _id: Types.ObjectId

    @ApiProperty({
        example: 'You know?',
    })
    title: string

    @ApiProperty({
        example: 'Yes!',
    })
    fact: string
}

@Schema()
export class Author {
    @ApiProperty({
        example: 'Stephen King',
    })
    @Prop({ required: true, maxlength: 200 })
    name: string

    @ApiProperty({
        example: 'stephen-king',
    })
    @Prop({ required: true, index: true })
    slug: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(FileDB) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    image: Types.ObjectId | FileDB

    @ApiProperty({
        example: 'This is a biography',
    })
    @Prop({ required: true, maxlength: 1500 })
    biography: string

    @ApiProperty({
        type: [TableInfo],
    })
    @Prop({
        required: true,
        type: [
            {
                _id: { required: true, type: Types.ObjectId },
                key: { required: true, maxlength: 50, type: String },
                value: { required: true, maxlength: 100, type: String },
            },
        ],
    })
    table_info: TableInfo[]

    @ApiProperty({
        type: [FunFacts],
        required: false,
    })
    @Prop({
        type: [
            {
                _id: { required: true, type: Types.ObjectId },
                title: { required: true, maxlength: 100, type: String },
                fact: { required: true, maxlength: 500, type: String },
            },
        ],
    })
    fun_facts: FunFacts[]

    @ApiProperty({
        example: ['https://example.com/reference'],
    })
    @Prop()
    references: string[]

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

    @ApiProperty({ default: true })
    @Prop({ default: true })
    status: boolean
}

export const AuthorSchema = SchemaFactory.createForClass(Author)
