import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  companyName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;
}
