import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class RankBook {
    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    book: Types.ObjectId

    @Prop({ required: true, min: 1, max: 5 })
    ranking: number
}

export const RankBookSchema = SchemaFactory.createForClass(RankBook)
