import { ApiProperty, PartialType } from '@nestjs/swagger'
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
    @ApiProperty({
        example: 'Age',
        maxLength: 50,
    })
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    key: string

    @ApiProperty({
        example: '18',
        maxLength: 100,
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    value: string
}

export class FunFactDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'You know?',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    title: string

    @ApiProperty({
        maxLength: 500,
        example: 'Yes!',
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    fact: string
}

export class AuthorDTO {
    @ApiProperty({
        maxLength: 200,
        example: 'Stiphen King',
    })
    @IsString()
    @MaxLength(200)
    @IsNotEmpty()
    name: string

    @ApiProperty({
        maxLength: 1500,
        example: 'Biography...',
    })
    @IsString()
    @MaxLength(1500)
    @IsNotEmpty()
    biography: string

    @ApiProperty({
        minItems: 1,
        type: [TableInfoDTO],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TableInfoDTO)
    @ArrayMinSize(1)
    table_info: Array<TableInfoDTO>

    @ApiProperty({
        minItems: 1,
        type: [FunFactDTO],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunFactDTO)
    @ArrayMinSize(1)
    fun_facts: Array<FunFactDTO>

    @ApiProperty({
        isArray: true,
        required: false,
        type: [String],
        example: ['https://reference.com'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    references?: Array<string>

    @ApiProperty({ type: 'string', format: 'binary' })
    image: any
}

export class UpdateAuthorDTO extends PartialType(AuthorDTO) {}
