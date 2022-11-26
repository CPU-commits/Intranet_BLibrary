import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/modules/users/entities/user.entity'
import { OID } from './oid.model'

export enum Permissions {
    'private',
    'public',
    'public_classroom',
}

export class FileDB {
    @ApiProperty({
        type: OID,
    })
    _id: OID

    @ApiProperty({
        example: 'Filename',
    })
    filename: string

    @ApiProperty({
        example: '$k9O2FE9!',
    })
    key: string

    @ApiProperty({
        example: 'https://example.com/file/$k9O2FE9!',
    })
    url: string

    @ApiProperty({
        type: User,
    })
    user: User

    @ApiProperty({
        example: 'User Title File',
    })
    title: string

    @ApiProperty({
        example: 'application/json',
    })
    type: string

    @ApiProperty()
    status: boolean

    @ApiProperty({
        enum: ['private', 'public', 'public_classroom'],
        example: 'private',
        default: 'private',
    })
    permissions: keyof typeof Permissions

    @ApiProperty({
        example: '2002/05/31',
    })
    date: string
}
