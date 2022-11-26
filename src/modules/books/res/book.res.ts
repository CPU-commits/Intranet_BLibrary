import { ApiProperty } from '@nestjs/swagger'
import { Book } from '../entities/book.entity'

export class BookRes {
    @ApiProperty()
    book: Book

    @ApiProperty({ example: 1 })
    ranking: number
}
