import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtNotVerifiedAuthGuard extends AuthGuard('jwt-not-verified') {}
