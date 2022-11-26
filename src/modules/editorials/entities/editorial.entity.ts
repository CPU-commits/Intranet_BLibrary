import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { FileDB } from 'src/models/file.model'

@Schema()
export class Editorial {
    @ApiProperty({
        example: 'El Barco De Vapor',
    })
    @Prop({ required: true, maxlength: 100 })
    editorial: string

    @ApiProperty({
        example: 'el-barco-de-vapor',
    })
    @Prop({ required: true, unique: true })
    slug: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(FileDB) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    image: Types.ObjectId | FileDB

    @Prop({ default: true })
    status: boolean

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true })
    date: Date
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial)
