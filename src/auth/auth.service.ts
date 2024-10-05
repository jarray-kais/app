import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { signupDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
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
}
