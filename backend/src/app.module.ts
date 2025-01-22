import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerificationController } from './verification/verification.controller';
import { VerificationService } from './verification/verification.service';
import { JwtModule } from '@nestjs/jwt';
import { InputController } from './input/input.controller';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Replace with a secure secret
      signOptions: { expiresIn: '1h' }, // Adjust token expiration as needed
    }),
  ],
  controllers: [VerificationController, InputController],
  providers: [VerificationService, JwtStrategy],
})
export class AppModule {}
