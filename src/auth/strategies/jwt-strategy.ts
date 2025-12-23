import { ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: any) {
    if (payload?.sub?.isVerified !== true) {
      throw new ForbiddenException('User is not verified.');
    }

    return { user: payload.sub, users_id: payload.users_id };
  }
}
