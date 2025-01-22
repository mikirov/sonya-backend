import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VerifyMessageDto } from '../dto/verify-message.dto';
import { VerificationService } from './verification.service';

@ApiTags('Verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Message verified and balance sufficient.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signature or insufficient balance.',
  })
  @ApiBody({ type: VerifyMessageDto })
  async verifyMessage(
    @Body() verifyMessageDto: VerifyMessageDto,
  ): Promise<{ success: boolean; jwt: string }> {
    const { walletAddress, signature } = verifyMessageDto;

    try {
      const isValid = await this.verificationService.verifySignatureAndBalance(
        walletAddress,
        signature,
      );

      if (isValid) {
        const jwt = this.verificationService.generateJWT(walletAddress);
        return { success: true, jwt };
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }

    throw new UnauthorizedException(
      'Invalid signature or insufficient balance',
    );
  }
}
