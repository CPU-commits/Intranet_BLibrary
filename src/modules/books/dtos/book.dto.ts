import { PartialType } from '@nestjs/mapped-types'
import {
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator'

export class BookDTO {
    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    name: string

    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    synopsis: string

    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    tags: Array<string>

    @IsMongoId()
    @IsNotEmpty()
    author: string

    @IsMongoId()
    @IsNotEmpty()
    editorial: string
}

export class UpdateBookDTO extends PartialType(BookDTO) {}
