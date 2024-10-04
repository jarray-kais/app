import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class signupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  password: string;
}
