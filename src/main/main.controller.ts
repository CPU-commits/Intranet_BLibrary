import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import handleRes from 'src/res/handleRes'

@Controller('main')
export class MainController {
    @Get('/healthz')
    healthz(@Res() res: Response) {
        handleRes(res)
    }
}
