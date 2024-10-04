import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';

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
}
