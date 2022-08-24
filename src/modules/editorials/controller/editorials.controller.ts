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
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { EditorialDTO, UpdateEditorialDTO } from '../dtos/editorial.dto'
import { EditorialsService } from '../service/editorials.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/editorials')
export class EditorialsController {
    constructor(private readonly editorialsService: EditorialsService) {}

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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Put('/update_editorial/:id')
    @UseInterceptors(FileInterceptor('image'))
    async updateEditorial(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idEditorial: string,
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Delete('/delete_editorial/:id')
    async deleteEditorial(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idEditorial: string,
    ) {
        try {
            await this.editorialsService.deleteEditorial(idEditorial)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
