import { IsString, MinLength, Matches } from 'class-validator';

export class resetPasswordDto {


  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  newPassword: string;
}
