import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'

@Schema()
export class Editorial {
    @Prop({ required: true, maxlength: 100 })
    editorial: string

    @Prop({ required: true, unique: true })
    slug: string

    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    image: Types.ObjectId | FileDB

    @Prop({ default: true })
    status: boolean

    @Prop({ required: true })
    date: Date
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial)
