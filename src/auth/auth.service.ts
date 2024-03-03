import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { hash, verify } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto, ITokenDto } from './dto';
import { ENVIRONMENT_VARIABLES, IToken } from '../core/model';

@Injectable({})
export class AuthService {
  constructor(
    private readonly _dbService: DatabaseService,
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
  ) {}

  async signUp(dto: AuthDto) {
    try {
      // Generate password hash
      const hashedPassword = await hash(dto.password);

      // Save new user to db
      const user = await this._dbService.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });

      // Return token
      return this.signToken({ sub: user.id, email: user.email });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials Taken');
      }
      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    // Find user by email
    const user = await this._dbService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // If user does not exists throw exception
    if (!user) throw new ForbiddenException('Credentials Incorrect');

    // Compare password
    const pwMatches = await verify(user.password, dto.password);

    // If password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials Incorrect');

    // Return token
    return this.signToken({ sub: user.id, email: user.email });
  }

  async signToken(dto: ITokenDto): Promise<IToken> {
    const payload = {
      sub: dto.sub,
      email: dto.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this._jwtService.signAsync(payload, {
        expiresIn: this._configService.get(
          ENVIRONMENT_VARIABLES.JWT_ACCESS_EXPIRATION,
        ),
        secret: this._configService.get(
          ENVIRONMENT_VARIABLES.JWT_ACCESS_SECRET,
        ),
      }),
      this._jwtService.signAsync(payload, {
        expiresIn: this._configService.get(
          ENVIRONMENT_VARIABLES.JWT_REFRESH_EXPIRATION,
        ),
        secret: this._configService.get(
          ENVIRONMENT_VARIABLES.JWT_REFRESH_SECRET,
        ),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
