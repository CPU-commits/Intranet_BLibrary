import { User } from 'src/modules/users/entities/user.entity'
import { OID } from './oid.model'

export enum Permissions {
    'private',
    'public',
    'public_classroom',
}

export class FileDB {
    _id: OID
    filename: string
    key: string
    url: string
    user: User
    title: string
    type: string
    status: boolean
    permissions: keyof typeof Permissions
    date: string
}
