import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(2 ** 12)
  @MinLength(2)
  readonly encryptionUserAgent: string;

  @IsString()
  @MaxLength(2 ** 6)
  @MinLength(2)
  readonly seedPhraseHash!: string;

  @IsString()
  @MaxLength(2 ** 7)
  @MinLength(2)
  readonly id!: string;
}
