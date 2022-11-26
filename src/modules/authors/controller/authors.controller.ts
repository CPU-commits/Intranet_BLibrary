import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Res,
    Delete,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Param,
    Put,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
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
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { AuthorDTO, UpdateAuthorDTO } from '../dtos/author.dto'
import { AuthorsService } from '../service/authors.service'
import { ResApi } from '../../../models/res.model'
import { Author } from '../entities/author.entity'

@ApiTags('Authors', 'Library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/authors')
export class AuthorsController {
    constructor(private readonly authorService: AuthorsService) {}

    @Get('/get_authors')
    @ApiOperation({
        summary: 'Get Authors',
        description: 'Get Authors',
    })
    @ApiTags('roles.all')
    @ApiExtraModels(Author)
    @ApiOkResponse({
        description: 'Get Authors',
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(Author),
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
    async getAuthors(@Res() res: Response) {
        try {
            const authors = await this.authorService.getAuthors()
            handleRes(res, {
                authors,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Get('/get_author/:slug')
    @ApiOperation({
        summary: 'Get Author',
        description: 'Get Author By Slug',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        description: 'Get Authors',
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(Author),
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    async getAuthor(@Res() res: Response, @Param('slug') authorSlug: string) {
        try {
            const author = await this.authorService.getAuthorBySlug(authorSlug)
            handleRes(res, {
                author,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Post('/upload_author')
    @ApiOperation({
        summary: 'Upload Author',
        description: 'Upload Author',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({ type: ResApi })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'AuthorDTO Model',
        type: AuthorDTO,
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @UseInterceptors(FileInterceptor('image'))
    async uploadAuthor(
        @Res() res: Response,
        @Body() author: AuthorDTO,
        @UploadedFile() image: Express.Multer.File,
    ) {
        try {
            if (
                !image.mimetype.includes('image') &&
                !image.mimetype.includes('img')
            )
                throw new BadRequestException('El archivo debe ser una imagen')
            await this.authorService.uploadAuthor(author, image)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Put('/update_author/:idAuthor')
    @ApiOperation({
        summary: 'Update Author',
        description: 'Update Author',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({ type: ResApi })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'UpdateAuthorDTO Model',
        type: UpdateAuthorDTO,
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @ApiNotFoundResponse({
        description: 'El autor no existe',
    })
    @UseInterceptors(FileInterceptor('image'))
    async updateAuthor(
        @Res() res: Response,
        @Body() author: UpdateAuthorDTO,
        @Param('idAuthor', MongoIdPipe) idAuthor: string,
        @UploadedFile() image?: Express.Multer.File,
    ) {
        try {
            if (
                image &&
                !image.mimetype.includes('image') &&
                !image.mimetype.includes('img')
            )
                throw new BadRequestException('El archivo debe ser una imagen')
            await this.authorService.updateAuthor(author, image, idAuthor)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @ApiOperation({
        summary: 'Delete Author',
        description: 'Delete Author',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @Delete('/delete_author/:idAuthor')
    @ApiOkResponse({ type: ResApi })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'El autor no existe',
    })
    async deleteAuthor(
        @Res() res: Response,
        @Param('idAuthor', MongoIdPipe) idAuthor: string,
    ) {
        try {
            await this.authorService.deleteAuthor(idAuthor)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
