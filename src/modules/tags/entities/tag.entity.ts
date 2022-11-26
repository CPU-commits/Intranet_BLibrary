import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Tag {
    @ApiProperty({
        example: 'Comedy',
    })
    @Prop({ required: true, maxlength: 100 })
    tag: string

    @ApiProperty({
        example: 'comedy',
    })
    @Prop({ required: true, unique: true, index: true })
    slug: string

    @Prop({ default: true })
    status: boolean

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true })
    date: Date
}

export const TagSchema = SchemaFactory.createForClass(Tag)
