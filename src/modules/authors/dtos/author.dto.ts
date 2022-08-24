import { PartialType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator'

export class TableInfoDTO {
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    key: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    value: string
}

export class FunFactDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    title: string

    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    fact: string
}

export class AuthorDTO {
    @IsString()
    @MaxLength(200)
    @IsNotEmpty()
    name: string

    @IsString()
    @MaxLength(1500)
    @IsNotEmpty()
    biography: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TableInfoDTO)
    @ArrayMinSize(1)
    table_info: Array<TableInfoDTO>

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunFactDTO)
    @ArrayMinSize(1)
    fun_facts: Array<FunFactDTO>

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    references?: Array<string>
}

export class UpdateAuthorDTO extends PartialType(AuthorDTO) {}
