import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateThemeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  theme: string;
}
