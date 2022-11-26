import { ApiProperty } from '@nestjs/swagger'

export class ResApi<T> {
    @ApiProperty()
    success: boolean

    @ApiProperty()
    message: string

    body: T
}
