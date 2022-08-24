import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BooksModule } from '../books/books.module'
import { TagsController } from './controller/tags.controller'
import { Tag, TagSchema } from './entities/tag.entity'
import { TagsService } from './service/tags.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Tag.name,
                schema: TagSchema,
            },
        ]),
        BooksModule,
    ],
    controllers: [TagsController],
    providers: [TagsService],
})
export class TagsModule {}
