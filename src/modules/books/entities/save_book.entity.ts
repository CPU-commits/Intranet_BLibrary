import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Book } from './book.entity'

@Schema()
export class SaveBook {
    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: Book.name }] })
    books: Types.Array<Types.ObjectId> | Array<Book>
}

export const SaveBookSchema = SchemaFactory.createForClass(SaveBook)
