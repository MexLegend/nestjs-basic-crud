import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENVIRONMENT_VARIABLES, JWT_STRATEGIES } from 'src/core/model';
import { DatabaseService } from 'src/database/database.service';
import { ITokenDto } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGIES.JWT_ACCESS,
) {
  constructor(
    readonly _configService: ConfigService,
    private readonly _dbService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.get(ENVIRONMENT_VARIABLES.JWT_ACCESS_SECRET),
    });
  }

  async validate(payload: ITokenDto) {
    const user = await this._dbService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.password;
    return user;
  }
}
