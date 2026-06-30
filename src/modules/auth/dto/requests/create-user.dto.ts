import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(2 ** 5)
  @MinLength(2)
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly firstName?: string;

  @MaxLength(2 ** 5)
  @MinLength(2)
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly lastName?: string;

  @IsString()
  @MaxLength(2 ** 1)
  @MinLength(2 ** 1)
  readonly lang: string;

  @MaxLength(2 ** 12)
  @MinLength(2 ** 9)
  @IsString()
  readonly rsaPublicKey!: string;

  @MaxLength(2 ** 14)
  @MinLength(2 ** 10)
  @IsString()
  readonly encryptedRsaPrivateKey!: string;

  @IsString()
  @MaxLength(2 ** 12)
  @MinLength(2)
  readonly encryptionUserAgent!: string;

  @IsString()
  @MaxLength(2 ** 6)
  @MinLength(2)
  readonly seedPhraseHash!: string;
}
