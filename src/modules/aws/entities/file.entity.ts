import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class File {
    @Prop({ required: true })
    filename: string

    @Prop({ required: true })
    key: string

    @Prop({ required: true })
    url: string

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @Prop({ required: true, maxlength: 100 })
    title: string

    @Prop({ required: true })
    type: string

    @Prop({ default: true })
    status: boolean

    @Prop({
        enum: ['private', 'public', 'public_classroom'],
        default: 'private',
    })
    permissions: string

    @Prop({ required: true, type: Date })
    date: string
}

export const SchemaFile = SchemaFactory.createForClass(File)
