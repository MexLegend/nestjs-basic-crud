import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EditUserDto } from 'src/user/dto';

@Injectable()
export class UserService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const user = await this._databaseService.user.update({
      where: {
        id: userId,
      },
      data: dto,
    });

    delete user.password;

    return user;
  }
}
