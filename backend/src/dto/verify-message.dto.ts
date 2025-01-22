import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyMessageDto {
  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
