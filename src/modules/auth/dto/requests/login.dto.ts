import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(2 ** 12)
  @MinLength(2)
  readonly encryptionUserAgent: string;
}
