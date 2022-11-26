import { ApiProperty } from '@nestjs/swagger'
import { Editorial } from '../entities/editorial.entity'

export class EditorialRes {
    @ApiProperty()
    editorial: Editorial
}
