import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersService } from './services/users/users.service'
// Entities
import { User, UserSchema } from './entities/user.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
