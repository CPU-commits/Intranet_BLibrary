import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { BookDTO, UpdateBookDTO } from '../dtos/book.dto'
import { RankBookDTO } from '../dtos/rank.dto'
import { Book } from '../entities/book.entity'
import { BookRes } from '../res/book.res'
import { BooksService } from '../service/books.service'

@ApiTags('Books', 'Library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get('/get_books')
    @ApiOperation({
        summary: 'Get Books',
        description: 'Get Books',
    })
    @ApiTags('roles.all')
    @ApiExtraModels(Book)
    @ApiQuery({ required: false, name: 'skip' })
    @ApiQuery({ required: false, name: 'limit' })
    @ApiQuery({ required: false, name: 'search' })
    @ApiQuery({ required: false, name: 'total' })
    @ApiQuery({ required: false, name: 'alphabet', enum: ['asc', 'desc'] })
    @ApiQuery({
        required: false,
        name: 'ranking',
        enum: ['1', '2', '3', '4', '5'],
    })
    @ApiQuery({ required: false, name: 'added', enum: ['asc', 'desc'] })
    @ApiQuery({ required: false, name: 'author' })
    @ApiQuery({ required: false, name: 'category' })
    @ApiQuery({ required: false, name: 'editorial' })
    @ApiQuery({ required: false, name: 'saved' })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(Book),
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
    async getBooks(
        @Res() res: Response,
        @Req() req: Request,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total') total?: boolean,
        @Query('alphabet') alphabet?: string,
        @Query('ranking') ranking?: number,
        @Query('added') added?: string,
        @Query('author') author?: string,
        @Query('category') category?: string,
        @Query('editorial') editorial?: string,
        @Query('saved') saved?: boolean,
    ) {
        try {
            const user = req.user as PayloadToken
            const books = await this.booksService.getBooks(
                user._id,
                skip,
                limit,
                search,
                total,
                alphabet,
                ranking,
                added,
                author,
                category,
                editorial,
                saved,
            )
            handleRes(res, {
                books,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Get Book',
        description: 'Get Book by slug',
    })
    @ApiTags('roles.all')
    @ApiExtraModels(BookRes)
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(BookRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @Get('/get_book/:slug')
    async getBook(
        @Res() res: Response,
        @Req() req: Request,
        @Param('slug') slug: string,
    ) {
        try {
            const user = req.user as PayloadToken
            const book = await this.booksService.getBookBySlug(slug, user._id)
            handleRes(res, {
                book: book.book,
                ranking: book.ranking,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Post('/upload_book')
    @ApiOperation({
        description: 'Upload Book',
        summary: 'Upload Book',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'BookDTO Model',
        type: BookDTO,
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @ApiBadRequestResponse({
        description: 'Se requiere una imagen del libro',
    })
    @ApiBadRequestResponse({
        description: 'Se requiere un archivo PDF del libro',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser un PDF',
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 1 },
            { name: 'book', maxCount: 1 },
        ]),
    )
    async uploadBook(
        @Res() res: Response,
        @Body() book: BookDTO,
        @UploadedFiles()
        files: {
            image?: Express.Multer.File[]
            book?: Express.Multer.File[]
        },
    ) {
        try {
            if (files?.image.length === 0)
                throw new BadRequestException(
                    'Se requiere una imagen del libro',
                )
            if (files?.book.length === 0)
                throw new BadRequestException(
                    'Se requiere un archivo PDF del libro',
                )
            if (
                !files.image[0].mimetype.includes('image') &&
                !files.image[0].mimetype.includes('img')
            )
                throw new BadRequestException('El archivo debe ser una imagen')
            if (!files.book[0].mimetype.includes('pdf'))
                throw new BadRequestException('El archivo debe ser un PDF')
            await this.booksService.uploadBook(
                book,
                files.image[0],
                files.book[0],
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Post('/save_book/:idBook')
    @ApiOperation({
        summary: 'Save Book',
        description: 'User save book like favorite',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    async saveBook(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idBook', MongoIdPipe) idBook: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.booksService.saveBook(user._id, idBook)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(RankBookDTO)
    @ApiOperation({
        description: 'Rank Book',
        summary: 'Rank Book',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @ApiBody({
        type: RankBookDTO,
    })
    @Post('/rank_book/:idBook')
    async rankBook(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idBook', MongoIdPipe) idBook: string,
        @Body() rank: RankBookDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.booksService.rankBook(rank.ranking, idBook, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Update book',
        summary: 'Update book',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiConsumes('multipart/form-data')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser una imagen',
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiBadRequestResponse({
        description: 'El archivo debe ser un PDF',
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @ApiBody({
        type: UpdateBookDTO,
        description: 'UpdateBookDTO Model',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Post('/update_book/:id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 1 },
            { name: 'book', maxCount: 1 },
        ]),
    )
    async updateBook(
        @Res() res: Response,
        @Body() book: UpdateBookDTO,
        @Param('id', MongoIdPipe) idBook: string,
        @UploadedFiles()
        files: {
            image?: Express.Multer.File[]
            book?: Express.Multer.File[]
        },
    ) {
        try {
            if (
                files?.image?.length > 0 &&
                !files.image[0].mimetype.includes('image') &&
                !files.image[0].mimetype.includes('img')
            )
                throw new BadRequestException('El archivo debe ser una imagen')
            if (
                files?.book?.length > 0 &&
                !files.book[0].mimetype.includes('pdf')
            )
                throw new BadRequestException('El archivo debe ser un PDF')
            await this.booksService.updateBook(
                book,
                idBook,
                files?.image?.length > 0 ? files.image[0] : undefined,
                files?.book?.length > 0 ? files.book[0] : undefined,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete book',
        summary: 'Delete book',
    })
    @ApiTags('roles.directive', 'roles.director', 'roles.librarian')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiServiceUnavailableResponse({
        description: 'MongoDB || Nats service unavailable',
    })
    @ApiNotFoundResponse({
        description: 'No existe el libro',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.LIBRARIAN)
    @Delete('/delete_book/:idBook')
    async deleteBook(
        @Res() res: Response,
        @Param('idBook', MongoIdPipe) idBook: string,
    ) {
        try {
            await this.booksService.deleteBook(idBook)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
