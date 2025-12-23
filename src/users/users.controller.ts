import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { User } from './entities/user.entity.js';
import { JwtGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ operationId: 'createUser' })
  @Post()
  @ApiCreatedResponse({ type: User })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto }) // Specify the request body type
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User, // Response type
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async create(createUserDto: CreateUserDto) {
    return new User(await this.usersService.create(createUserDto));
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ operationId: 'getMe' })
  @Get('me')
  @ApiOkResponse({ type: User })
  @HttpCode(HttpStatus.OK)
  async findOne(id: number) {}

  async update(id: number, updateUserDto: UpdateUserDto) {}

  async remove(id: number) {}
}
