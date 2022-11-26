import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator'

export class BookDTO {
    @ApiProperty({
        maxLength: 150,
        example: '1984',
    })
    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    name: string

    @ApiProperty({
        maxLength: 500,
        example: 'Synopsis...',
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    synopsis: string

    @ApiProperty({
        minItems: 1,
        type: 'array',
        items: { type: 'string' },
        description: 'Array<MongoId>',
        example: ['63825e196593f86585dc2b8c'],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    tags: Array<string>

    @ApiProperty({
        description: 'MongoID',
        example: '63825e196593f86585dc2b8c',
    })
    @IsMongoId()
    @IsNotEmpty()
    author: string

    @ApiProperty({
        example: '63825e196593f86585dc2b8c',
    })
    @IsMongoId()
    @IsNotEmpty()
    editorial: string

    @ApiProperty({ type: 'string', format: 'binary' })
    image: any

    @ApiProperty({ type: 'string', format: 'binary' })
    book: any
}

export class UpdateBookDTO extends PartialType(BookDTO) {}
