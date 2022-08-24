import { IsInt, IsNotEmpty, Max, Min } from 'class-validator'

export class RankBookDTO {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    ranking: number
}
