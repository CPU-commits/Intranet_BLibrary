import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'

export class TableInfo {
    _id: Types.ObjectId
    key: string
    value: string
}

export class FunFacts {
    _id: Types.ObjectId
    title: string
    fact: string
}

@Schema()
export class Author {
    @Prop({ required: true, maxlength: 200 })
    name: string

    @Prop({ required: true, index: true })
    slug: string

    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    image: Types.ObjectId | FileDB

    @Prop({ required: true, maxlength: 1500 })
    biography: string

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

    @Prop()
    references: string[]

    @Prop({ required: true })
    date_upload: Date

    @Prop({ required: true })
    date_update: Date

    @Prop({ default: true })
    status: boolean
}

export const AuthorSchema = SchemaFactory.createForClass(Author)
