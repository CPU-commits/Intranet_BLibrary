import { ApiProperty } from '@nestjs/swagger'
import { Editorial } from '../entities/editorial.entity'

export class EditorialsRes {
    @ApiProperty()
    editorials: Array<Editorial>
}
