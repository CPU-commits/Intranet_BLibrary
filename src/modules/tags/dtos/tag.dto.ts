import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class TagDTO {
    @ApiProperty({
        example: 'Comedy',
        maxLength: 100,
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    tag: string
}

export class UpdateTagDTO extends PartialType(TagDTO) {}
