import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { TagDTO } from '../dtos/tag.dto'
import { TagsService } from '../service/tags.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get('/get_tags')
    async getTags(@Res() res: Response) {
        try {
            const tags = await this.tagsService.getTags()
            handleRes(res, {
                tags,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Post('/new_tag')
    async newTag(@Res() res: Response, @Body() tag: TagDTO) {
        try {
            const tagData = await this.tagsService.newTag(tag)
            handleRes(res, {
                tag: tagData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Delete('/delete_tag/:id')
    async deleteTag(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idTag: string,
    ) {
        try {
            await this.tagsService.deleteTag(idTag)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
