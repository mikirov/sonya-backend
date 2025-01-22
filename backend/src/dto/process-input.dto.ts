import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessInputDto {
  @ApiProperty({ description: 'The text input to be processed.' })
  @IsString()
  input: string;
}
