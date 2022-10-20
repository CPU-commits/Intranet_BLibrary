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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/authors')
export class AuthorsController {
    constructor(private readonly authorService: AuthorsService) {}

    @Get('/get_authors')
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

    @Get('/get_author/:id')
    async getAuthor(@Res() res: Response, @Param('id') authorSlug: string) {
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
    @Put('/update_author/:id')
    @UseInterceptors(FileInterceptor('image'))
    async updateAuthor(
        @Res() res: Response,
        @Body() author: UpdateAuthorDTO,
        @Param('id', MongoIdPipe) idAuthor: string,
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
    @Delete('/delete_author/:id')
    async deleteAuthor(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idAuthor: string,
    ) {
        try {
            await this.authorService.deleteAuthor(idAuthor)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
