import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Tag {
    @Prop({ required: true, maxlength: 100 })
    tag: string

    @Prop({ required: true, unique: true, index: true })
    slug: string

    @Prop({ default: true })
    status: boolean

    @Prop({ required: true })
    date: Date
}

export const TagSchema = SchemaFactory.createForClass(Tag)
