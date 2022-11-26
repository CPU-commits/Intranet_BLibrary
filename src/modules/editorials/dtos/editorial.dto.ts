import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class EditorialDTO {
    @ApiProperty({
        example: 'Barco De Vapor',
        maxLength: 100,
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    editorial: string

    @ApiProperty({ type: 'string', format: 'binary' })
    image: any
}

export class UpdateEditorialDTO extends PartialType(EditorialDTO) {}
