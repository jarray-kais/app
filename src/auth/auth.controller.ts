import { Controller, Post, Body, UseGuards, Req, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guards';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupData: signupDto) {
    return this.authService.signup(signupData);
  }

  @Post('/login')
  async login(@Body() loginData: loginDto) {
    return this.authService.validateAndLogin(
      loginData.email,
      loginData.password,
    );
  }

  // POST /changepassword
  @UseGuards(AuthGuard)
  @Put('/changepassword')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req?.user._id,

      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
