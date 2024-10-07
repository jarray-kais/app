import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { signupDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(signupData: signupDto) {
    //check if email is in user
    const existemail = await this.UserModel.findOne({
      email: signupData.email,
    });
    if (existemail) {
      throw new BadRequestException('Email already exists');
    }
    //hash password
    const hashedPassword = await bcrypt.hashSync(signupData.password, 10);

    //create user and save
    const user = new this.UserModel({
      name: signupData.name,
      email: signupData.email,
      password: hashedPassword,
    });

    return await user.save();
  }
  async validateAndLogin(
    email: string,
    password: string,
  ): Promise<{
    _id: string;
    name: string;
    email: string;
    access_token: string;
  }> {
    // Recherche l'utilisateur dans la base de données par email
    const user = await this.UserModel.findOne({ email });
    console.log(user);
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Invalid credentials user');
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('Password mismatch');
      throw new UnauthorizedException('Invalid credentials password');
    }

    console.log('Credentials are valid');

    // jeton avec les informations de l'utilisateur
    const payload = { username: user.email, _id: user._id };
    const access_token = this.jwtService.sign(payload);

    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      access_token,
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    console.log(userId);
    // find user
    const user = await this.UserModel.findById(userId);
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // check old password
    console.log(oldPassword);
    console.log(user.password);
    const passwordMatch = await bcrypt.compareSync(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Old password does not match');
    }
    // hash new password
    const hashedPassword = await bcrypt.hashSync(newPassword, 10);
    // update password
    user.password = hashedPassword;
    await user.save();
    return 'Password updated successfully';
  }

  getBaseUrl() {
    return (
      process.env.BASE_URL ||
      (process.env.NODE_ENV !== 'production'
        ? 'http://localhost:3000'
        : 'https://yourdomain.com')
    );
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Generate a token that expires in 1 hour
    const token = this.jwtService.sign(
      { _id: user._id },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' },
    );

    // Save the token in the user record
    await this.UserModel.updateOne(
      { _id: user._id },
      { $set: { resetToken: token } },
      { strict: false },
    );

    //create password reset URL
    const resetUrl = `${this.getBaseUrl()}/reset-password/${token}`;
    const emailContent = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #007BFF;">Password Reset Request</h2>
    <p style="font-size: 16px; line-height: 1.5;">
      Hello,
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
      Please click the link below to reset your password. This link will expire in 1 hour.
    </p>
    <a href="${resetUrl}" 
       style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; font-size: 16px;">
       Reset Password
    </a>
    <p style="margin-top: 20px; font-size: 12px; color: #555;">
      If you did not request this, please ignore this email.
    </p>
  </div>
`;

    // Send email with password reset URL
    await this.emailService.sendMail(
      user.email,
      'Reset Password',
      emailContent,
    );
    return { message: 'We have sent a password reset link to your email.' };
  }
}
