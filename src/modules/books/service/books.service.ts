import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { FilterQuery, Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import * as slug from 'slug'
import { FileDB } from 'src/models/file.model'
import { AwsService } from 'src/modules/aws/service/aws.service'
import { Editorial } from 'src/modules/editorials/entities/editorial.entity'
import { BookDTO, UpdateBookDTO } from '../dtos/book.dto'
import { Book } from '../entities/book.entity'
import { RankBook } from '../entities/rank_book.entity'
import { SaveBook } from '../entities/save_book.entity'

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name) private readonly bookModel: Model<Book>,
        @InjectModel(SaveBook.name)
        private readonly saveBookModel: Model<SaveBook>,
        @InjectModel(RankBook.name)
        private readonly rankBookModel: Model<RankBook>,
        private readonly awsService: AwsService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    async bookHasTag(idTag: string): Promise<boolean> {
        const book = await this.bookModel
            .findOne({ tags: { $in: [idTag] } }, { _id: 1 })
            .exec()
        return book != null
    }

    async bookHasEditorial(idEditorial: string): Promise<boolean> {
        const book = await this.bookModel
            .findOne({ editorial: idEditorial }, { _id: 1 })
            .exec()
        return book != null
    }

    async bookHasAuthor(idAuthor: string): Promise<boolean> {
        const book = await this.bookModel
            .findOne({ author: idAuthor }, { _id: 1 })
            .exec()
        return book != null
    }

    async getBookById(idBook: string) {
        return await this.bookModel.findById(idBook).exec()
    }

    async getBooks(
        idUser: string,
        skip?: number,
        limit?: number,
        search?: string,
        total = false,
        alphabet?: string,
        ranking?: number,
        added?: string,
        author?: string,
        category?: string,
        editorial?: string,
        saved?: boolean,
    ) {
        const booksSaved = await this.saveBookModel.findOne({
            user: idUser,
        })
        const filter: FilterQuery<Book> = {}
        if (search)
            filter.$or = [
                {
                    name: {
                        $regex: new RegExp(search, 'i'),
                    },
                },
                {
                    synopsis: {
                        $regex: new RegExp(search, 'i'),
                    },
                },
            ]
        if (ranking)
            filter.ranking = {
                $gte: ranking,
            }
        if (author) filter.author = author
        if (category)
            filter.tags = {
                $in: [category],
            }
        if (editorial) filter.editorial = editorial
        if (saved && booksSaved) {
            filter._id = {
                $in: booksSaved.books.map((book) => {
                    return new ObjectId(book)
                }),
            }
        } else if (saved) {
            return {
                books: [],
            }
        }
        const books = this.bookModel.find(filter, { synopsis: 0 })
        if (skip) books.skip(skip)
        if (limit) books.limit(limit)
        if (alphabet) books.sort({ name: alphabet === 'asc' ? 1 : -1 })
        if (added) {
            const options = books.getOptions()
            if (options.sort) {
                books.sort({
                    ...options.sort,
                    date_upload: added === 'asc' ? 1 : -1,
                })
            } else {
                books.sort({ date_upload: added === 'asc' ? 1 : -1 })
            }
        }
        const booksData = await books
            .populate('image', { key: 1 })
            .populate('tags', { tag: 1 })
            .populate('author', { name: 1 })
            .populate('editorial', { editorial: 1 })
            .exec()
        // Get images
        const urlImages: Array<string> = await lastValueFrom(
            this.natsClient.send(
                'get_aws_token_access',
                booksData.map((book) => {
                    const image = book.image as FileDB
                    return image.key
                }),
            ),
        )
        urlImages.forEach((image, i) => {
            booksData[i].image = {
                url: image,
            } as FileDB
        })
        return {
            books: booksData.map((book) => {
                const {
                    _id,
                    name,
                    synopsis,
                    tags,
                    author,
                    image,
                    editorial,
                    ranking,
                    slug,
                } = book
                const isSaved = booksSaved?.books?.some((b) => {
                    return b.toString() === _id.toString()
                })
                return {
                    _id,
                    name,
                    synopsis,
                    tags,
                    author,
                    ranking,
                    image,
                    editorial,
                    slug,
                    is_saved: isSaved,
                }
            }),
            total: total ? await this.bookModel.count().exec() : undefined,
        }
    }

    async getBookBySlug(slug: string, idUser: string) {
        const book = await this.bookModel
            .findOne({ slug })
            .populate('tags', { tag: 1 })
            .populate('author', { name: 1, slug: 1 })
            .populate('image', { key: 1 })
            .populate('book', { key: 1 })
            .populate({
                path: 'editorial',
                select: 'editorial image',
                populate: {
                    path: 'image',
                    select: 'key',
                },
            })
            .exec()
        if (!book) throw new NotFoundException('No existe el libro')
        const personalRanking = await this.rankBookModel
            .findOne({
                user: idUser,
            })
            .exec()
        const bookFile = book.book as FileDB
        const image = book.image as FileDB
        const editorialImage = book.editorial as Editorial & { image: FileDB }
        const imageUrls: Array<string> = await lastValueFrom(
            this.natsClient.send('get_aws_token_access', [
                bookFile.key,
                image.key,
                editorialImage.image.key,
            ]),
        )
        // Assign urls
        book.book = {
            url: imageUrls[0],
        } as FileDB
        book.image = {
            url: imageUrls[1],
        } as FileDB
        ;(book.editorial as Editorial).image = {
            url: imageUrls[2],
        } as FileDB
        return {
            book,
            ranking: personalRanking?.ranking,
        }
    }

    async uploadBook(
        book: BookDTO,
        image: Express.Multer.File,
        bookFile: Express.Multer.File,
    ) {
        const fileImageDB = await this.awsService.uploadFileToDB(image, 'books')
        const fileBookDB = await this.awsService.uploadFileToDB(
            bookFile,
            'books',
        )
        const now = new Date()
        const newBook = new this.bookModel({
            ...book,
            slug: slug(book.name),
            image: fileImageDB._id.$oid,
            book: fileBookDB._id.$oid,
            date_update: now,
            date_upload: now,
        })
        return await newBook.save()
    }

    async saveBook(idUser: string, idBook: string) {
        const book = await this.getBookById(idBook)
        if (!book) throw new NotFoundException('No existe el libro')
        const booksSaved = await this.saveBookModel.findOne({ user: idUser })
        if (!booksSaved) {
            const newSaveBook = new this.saveBookModel({
                user: idUser,
                books: [idBook],
            })
            return await newSaveBook.save()
        } else {
            if (booksSaved.books.some((b) => b.toString() === idBook)) {
                return await this.saveBookModel.findByIdAndUpdate(
                    booksSaved._id,
                    {
                        $pull: {
                            books: idBook,
                        },
                    },
                    {
                        new: true,
                    },
                )
            } else {
                return await this.saveBookModel.findByIdAndUpdate(
                    booksSaved._id,
                    {
                        $push: {
                            books: idBook,
                        },
                    },
                    {
                        new: true,
                    },
                )
            }
        }
    }

    async rankBook(ranking: number, idBook: string, idUser: string) {
        const book = await this.getBookById(idBook)
        if (!book) throw new NotFoundException('No existe el libro')

        const rank = await this.rankBookModel.findOne({
            user: idUser,
        })
        if (rank) {
            return await this.rankBookModel
                .findByIdAndUpdate(
                    rank._id,
                    {
                        $set: {
                            ranking,
                        },
                    },
                    { new: true },
                )
                .exec()
        } else {
            const newRank = new this.rankBookModel({
                user: idUser,
                book: idBook,
                ranking,
            })
            return await newRank.save()
        }
    }

    async updateBook(
        book: UpdateBookDTO,
        idBook: string,
        image?: Express.Multer.File,
        bookFile?: Express.Multer.File,
    ) {
        const bookData = await this.getBookById(idBook)
        if (!bookData) throw new NotFoundException('No existe el libro')

        const deleteFiles: Array<string> = []
        let imageDB: FileDB
        let bookFileDB: FileDB
        if (image) {
            imageDB = await this.awsService.uploadFileToDB(image, 'books')
            deleteFiles.push(bookData.image.toString())
        }
        if (bookFile) {
            bookFileDB = await this.awsService.uploadFileToDB(bookFile, 'books')
            deleteFiles.push(bookData.book.toString())
        }
        const now = new Date()
        const updatedBook = await this.bookModel
            .findByIdAndUpdate(
                idBook,
                {
                    $set: {
                        ...book,
                        date_update: now,
                        image: imageDB ? imageDB._id.$oid : undefined,
                        book: bookFileDB ? bookFileDB._id.$oid : undefined,
                        slug: book.name ? slug(book.name) : undefined,
                    },
                },
                { new: true },
            )
            .exec()
        if (deleteFiles.length > 0)
            this.natsClient.emit('delete_files', deleteFiles)
        return updatedBook
    }

    async deleteBook(idBook: string) {
        const bookData = await this.getBookById(idBook)
        if (!bookData) throw new NotFoundException('No existe el libro')

        await this.saveBookModel
            .updateMany(
                null,
                {
                    $pull: {
                        books: idBook,
                    },
                },
                { new: true },
            )
            .exec()
        return await this.bookModel.findByIdAndDelete(idBook).exec()
    }
}
