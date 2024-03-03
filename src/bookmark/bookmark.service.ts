import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    return this._databaseService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getBookmarks(userId: string) {
    return await this._databaseService.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(userId: string, bookmarkId: string) {
    return await this._databaseService.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async editBookmarkById(
    userId: string,
    bookmarkId: string,
    dto: EditBookmarkDto,
  ) {
    // Get the bookmark by id
    const bookmark = await this._databaseService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // Check if the current user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return await this._databaseService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: dto,
    });
  }

  async deleteBookmarkById(userId: string, bookmarkId: string) {
    // Get the bookmark by id
    const bookmark = await this._databaseService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // Check if the current user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return await this._databaseService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
