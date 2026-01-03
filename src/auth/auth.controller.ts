import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { TokensDto } from './dto/tokens.dto.js';
import { AuthUserDto } from './dto/auth-user.dto.js';
import { User } from '../users/entities/user.entity.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtNotVerifiedAuthGuard } from './guards/jwt-not-verified-auth.guard.js';
import { GetCurrentUser } from '../common/decorators/get-current-user.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ConfirmEmailDto } from './dto/confirm-email.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { EmailService } from '../email/email.service.js';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  #validatePasswordMatch(password: string, repeatPassword: string): void {
    if (password !== repeatPassword) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @ApiOperation({ operationId: 'login' })
  @ApiCreatedResponse({ type: TokensDto })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 401,
    description: 'Incorrect username or password',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async login(@Body() authData: AuthUserDto) {
    const user = await this.usersService.findOneByEmail(authData.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const confirmation = await this.authService.getUserConfirmation(user.id);

    return await this.authService.login(
      user as User,
      confirmation?.verified ?? false,
    );
  }

  @Post('register')
  @ApiOperation({ operationId: 'register' })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiCreatedResponse({ type: User })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationCode = await this.authService.createEmailVerification(
      user.id,
    );

    try {
      await this.emailService.sendSignupEmail(
        user as Omit<User, 'password'>,
        verificationCode,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

    return user;
  }

  @Post('forgot-password')
  @ApiOperation({ operationId: 'forgotPassword' })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { id, user } = await this.authService.forgotPassword(
      forgotPasswordDto.email,
    );

    await this.emailService.sendResetEmail(
      user as User,
      id,
      forgotPasswordDto.redirectURL,
    );
  }

  // Unauthenticated user changes password
  @Post('reset-password')
  @ApiOperation({ operationId: 'resetPassword' })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.OK)
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { otp, password, repeatPassword } = resetPasswordDto;

    this.#validatePasswordMatch(password, repeatPassword);

    const user = await this.authService.resetPassword(password, otp);

    // todo add send email through email service that password has been updated and pass user object into it
  }

  // Authenticated user changes password
  @UseGuards(JwtNotVerifiedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ operationId: 'changePassword' })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetCurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { password, repeatPassword } = changePasswordDto;

    this.#validatePasswordMatch(password, repeatPassword);

    await this.authService.changePassword(user.id, password);

    // todo add send via emailService the password update notification
  }

  @UseGuards(JwtNotVerifiedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('confirm-email')
  @ApiOperation({ operationId: 'confirmEmail' })
  @ApiCreatedResponse({ type: TokensDto })
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @GetCurrentUser() user: User,
    @Body() confirmEmailDto: ConfirmEmailDto,
  ) {
    await this.authService.confirmEmail(user.id, confirmEmailDto.code);

    const confirmation = await this.authService.getUserConfirmation(user.id);

    return await this.authService.login(user as User, !!confirmation?.verified);
  }

  @UseGuards(JwtNotVerifiedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('is-verified')
  @ApiOperation({ operationId: 'isVerified' })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.OK)
  async isVerified(@GetCurrentUser() user: User) {
    const userRecord = await this.authService.getUserConfirmation(user.id);

    if (!userRecord) {
      throw new NotFoundException('User is not verified');
    }

    if (!userRecord.verified) {
      throw new ForbiddenException('User is not verified.');
    }
  }

  @UseGuards(JwtNotVerifiedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('resend-code')
  @ApiOperation({ operationId: 'resendCode' })
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.OK)
  async resendCode(@GetCurrentUser() user: User) {
    const confirmation = await this.authService.getUserConfirmation(user.id);

    if (confirmation && confirmation.verified) {
      throw new BadRequestException('User already confirmed');
    }

    const verificationCode = await this.authService.createEmailVerification(user.id);

    try {
      await this.emailService.sendSignupEmail(
        user as Omit<User, 'password'>,
        verificationCode,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

    return { message: 'Verification code sent successfully' };
  }

  @UseGuards(JwtNotVerifiedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('refresh-token')
  @ApiOperation({ operationId: 'refreshToken' })
  @ApiCreatedResponse({ type: TokensDto })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentUser() user: User,
    @Body() refreshData: RefreshTokenDto,
  ) {
    const confirmation = await this.authService.getUserConfirmation(user.id);

    const accessToken = await this.authService.refreshToken(
      user,
      !!confirmation?.verified,
    );

    return new TokensDto({
      accessToken,
      refreshToken: refreshData.refreshToken,
    });
  }
}
