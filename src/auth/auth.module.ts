import { Module } from '@nestjs/common'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'

import { UsersModule } from 'src/modules/users/users.module'
import config from 'src/config'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [config.KEY],
            useFactory: (configService: ConfigType<typeof config>) => {
                const signOptions: JwtSignOptions = {
                    algorithm: 'HS256',
                }
                if (configService.node_env === 'prod')
                    signOptions.expiresIn = '3h'
                return {
                    secret: configService.jwtSecret,
                    signOptions,
                }
            },
        }),
    ],
    providers: [JwtStrategy],
})
export class AuthModule {}
