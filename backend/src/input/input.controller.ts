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

      // Forward the input to the agent's message endpoint using fetch
      let responseText;

      try {
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const messageData: any = await messageResponse.json();
        this.logger.log('Message response:', messageData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        responseText = messageData[0]?.text;

        this.logger.log('Message response:', responseText);
      } catch (e) {
        console.error(e);
      }

      this.logger.log('Message response:', responseText);

      try {
        // Create URL-encoded body
        // const urlEncodedBody = new URLSearchParams();
        // urlEncodedBody.append('text', input);
  
        // Request the audio from the agent's speak endpoint using fetch
        let audioBuffer;
        try {
          const audioResponse = await fetch(`${agentUrl}/${agentId}/tts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input }),
          });
  
          this.logger.log(audioResponse);
  
          if (!audioResponse.ok) {
            throw new InternalServerErrorException(
              `Failed to process audio. Status: ${audioResponse.status}`,
            );
          }
  
          audioBuffer = await audioResponse.arrayBuffer();
  
          this.logger.log('Audio response received.');
        } catch (e) {
          console.error(e);
        }

      // Return both the text and audio data
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        response: responseText,
        audio: audioBuffer
          ? `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString(
              'base64',
            )}`
          : null,
      };
    } catch (error) {
      this.logger.error(
        'Error processing input or retrieving audio:',

        error,
      );

      throw new InternalServerErrorException(
        'Failed to process input and retrieve audio.',
      );
    }
  }
}
