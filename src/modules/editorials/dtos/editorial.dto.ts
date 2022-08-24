import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class EditorialDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    editorial: string
}

export class UpdateEditorialDTO extends PartialType(EditorialDTO) {}
