import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '../../entities/user.entity'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async getUserID(user_id: string) {
        return await this.userModel.findById(user_id).exec()
    }

    async getUserRUT(rut: string) {
        return await this.userModel.findOne({ rut }).exec()
    }
}
