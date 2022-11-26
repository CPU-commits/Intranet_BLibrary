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
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { TagDTO } from '../dtos/tag.dto'
import { Tag } from '../entities/tag.entity'
import { TagsService } from '../service/tags.service'

@ApiTags('Tags', 'Library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @ApiOperation({
        description: 'Get tags',
        summary: 'Get tags',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(Tag),
                            },
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
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

    @ApiOperation({
        description: 'New tag',
        summary: 'New tag',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
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

    @ApiOperation({
        description: 'Delete tag',
        summary: 'Delete tag',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiNotFoundResponse({
        description: 'No existe el tag',
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Delete('/delete_tag/:idTag')
    async deleteTag(
        @Res() res: Response,
        @Param('idTag', MongoIdPipe) idTag: string,
    ) {
        try {
            await this.tagsService.deleteTag(idTag)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
