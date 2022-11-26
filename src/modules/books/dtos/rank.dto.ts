import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator'

export class RankBookDTO {
    @ApiProperty({
        minimum: 1,
        maximum: 5,
        enum: [1, 2, 3, 4, 5],
        type: 'integer',
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    ranking: number
}
