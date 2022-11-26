import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
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
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { EditorialDTO, UpdateEditorialDTO } from '../dtos/editorial.dto'
import { Editorial } from '../entities/editorial.entity'
import { EditorialRes } from '../res/editorial.res'
import { EditorialsRes } from '../res/editorials.res'
import { UplaodEditorialRes } from '../res/upload.res'
import { EditorialsService } from '../service/editorials.service'

@ApiTags('Editorials', 'Library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/editorials')
export class EditorialsController {
    constructor(private readonly editorialsService: EditorialsService) {}

    @ApiExtraModels(Editorial)
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
                            $ref: getSchemaPath(EditorialsRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @Get('/get_editorials')
    async getEditorials(@Res() res: Response) {
        try {
            const editorials = await this.editorialsService.getEditorials()
            handleRes(res, {
                editorials,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(EditorialRes)
    @ApiOperation({
        description: 'Upload Editorial',
        summary: 'Upload Editorial',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: EditorialDTO,
        description: 'EditorialDTO Model',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(EditorialRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Post('/upload_editorial')
    @UseInterceptors(FileInterceptor('image'))
    async uploadEditorial(
        @Res() res: Response,
        @Body() editorial: EditorialDTO,
        @UploadedFile() image: Express.Multer.File,
    ) {
        try {
            if (
                !image.mimetype.includes('image') &&
                !image.mimetype.includes('img')
            )
                throw new BadRequestException('El archivo debe ser una imagen')
            const editorialData = await this.editorialsService.uploadEditorial(
                editorial,
                image,
            )
            handleRes(res, {
                editorial: editorialData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(UplaodEditorialRes)
    @ApiOperation({
        description: 'Update Editorial',
        summary: 'Update Editorial',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: UpdateEditorialDTO,
        description: 'UpdateEditorialDTO Model',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(UplaodEditorialRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Put('/update_editorial/:idEditorial')
    @UseInterceptors(FileInterceptor('image'))
    async updateEditorial(
        @Res() res: Response,
        @Param('idEditorial', MongoIdPipe) idEditorial: string,
        @Body() editorial?: UpdateEditorialDTO,
        @UploadedFile() image?: Express.Multer.File,
    ) {
        try {
            const editorialData = await this.editorialsService.updateEditorial(
                idEditorial,
                editorial,
                image,
            )
            handleRes(res, {
                image: editorialData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete Editorial',
        summary: 'Delete Editorial',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'No existe la editorial',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Delete('/delete_editorial/:idEditorial')
    async deleteEditorial(
        @Res() res: Response,
        @Param('idEditorial', MongoIdPipe) idEditorial: string,
    ) {
        try {
            await this.editorialsService.deleteEditorial(idEditorial)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
