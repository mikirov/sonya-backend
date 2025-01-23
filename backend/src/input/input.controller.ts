import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessInputDto } from '../dto/process-input.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@ApiTags('Input')
@Controller('input')
export class InputController {
  private readonly logger = new Logger(InputController.name);

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('process-input')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Input successfully processed by the agent.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error processing input.',
  })
  @ApiBody({ type: ProcessInputDto })
  async processInput(@Body() processInputDto: ProcessInputDto): Promise<any> {
    this.logger.log('Processing input:', processInputDto);
    const { input } = processInputDto;
    const agentUrl = process.env.AGENT_URL;
    const agentId = process.env.AGENT_ID;

    if (!agentUrl || !agentId) {
      throw new InternalServerErrorException(
        'AGENT_URL or AGENT_ID is not defined.',
      );
    }

    let responseText: string;
    let audioStream: Buffer;

    try {
      // Step 1: Forward the input to the agent's message endpoint
      const messageResponse = await fetch(`${agentUrl}/${agentId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!messageResponse.ok) {
        throw new InternalServerErrorException(
          `Failed to process message. Status: ${messageResponse.status}`,
        );
      }

      const messageData: any = await messageResponse.json();
      responseText = messageData[0]?.text;

      if (!responseText) {
        throw new InternalServerErrorException('No text response received.');
      }

      this.logger.log('Message response:', responseText);

      // // Step 2: Fetch the audio from the tts endpoint
      // const audioResponse = await fetch(`${agentUrl}/${agentId}/tts`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ text: responseText }),
      // });

      // if (!audioResponse.ok) {
      //   throw new InternalServerErrorException(
      //     `Failed to process audio. Status: ${audioResponse.status}`,
      //   );
      // }

      // if(!audioResponse.body) {
      //   throw new InternalServerErrorException('No audio response received.');
      // }

      // // Stream audio response into a Buffer
      // const chunks: any[] = [];
      // for await (const chunk of audioResponse.body) {
      //   chunks.push(chunk);
      // }
      // audioStream = Buffer.concat(chunks);

      // this.logger.log('Audio response received.');

      // Step 3: Return the text and audio response
      return {
        response: responseText,
        // audio: `data:audio/mpeg;base64,${audioStream.toString('base64')}`,
      };
    } catch (error) {
      this.logger.error('Error processing input or retrieving audio:', error);
      throw new InternalServerErrorException(
        'Failed to process input and retrieve audio.',
      );
    }
  }
}