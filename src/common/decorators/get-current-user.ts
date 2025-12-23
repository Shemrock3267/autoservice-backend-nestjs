import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../../users/entities/user.entity.js';

export const GetCurrentUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();

    return request.user.user;
  },
);
