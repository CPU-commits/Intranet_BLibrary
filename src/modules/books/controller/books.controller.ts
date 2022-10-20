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
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { BookDTO, UpdateBookDTO } from '../dtos/book.dto'
import { RankBookDTO } from '../dtos/rank.dto'
import { BooksService } from '../service/books.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/l/books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get('/get_books')
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

    @Post('/save_book/:id')
    async saveBook(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idBook: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.booksService.saveBook(user._id, idBook)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Post('/rank_book/:id')
    async rankBook(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idBook: string,
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

    @Delete('/delete_book/:id')
    async deleteBook(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idBook: string,
    ) {
        try {
            await this.booksService.deleteBook(idBook)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
