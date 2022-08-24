import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class TagDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    tag: string
}

export class UpdateTagDTO extends PartialType(TagDTO) {}
