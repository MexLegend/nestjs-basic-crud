import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGIES } from 'src/core/model';

export class JwtGuard extends AuthGuard(JWT_STRATEGIES.JWT_ACCESS) {
  constructor() {
    super();
  }
}
