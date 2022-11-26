import { ApiProperty } from '@nestjs/swagger'

export class OID {
    @ApiProperty({ example: '6381443089f43ed15c4398ad' })
    $oid: string
}
