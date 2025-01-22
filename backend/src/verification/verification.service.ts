import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

@Injectable()
export class VerificationService {
  private readonly rpcUrl: string;
  private readonly contractAddress: string;
  private readonly minimumBalance: number;

  constructor(private jwtService: JwtService) {
    this.rpcUrl = process.env.RPC_URL!;
    this.contractAddress = process.env.CONTRACT_ADDRESS!;
    this.minimumBalance = Number(process.env.MINIMUM_BALANCE!);
  }

  async verifySignatureAndBalance(
    walletAddress: string,
    signature: string,
  ): Promise<boolean> {
    const message = 'Hello Sonya';

    // Recover address from the signed message
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    // Connect to the blockchain and check the balance
    const provider = new ethers.JsonRpcProvider(this.rpcUrl);
    const contract = new ethers.Contract(
      this.contractAddress,
      ['function balanceOf(address owner) view returns (uint256)'],
      provider,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const balance: bigint = await contract.balanceOf(walletAddress);

    if (balance < BigInt(this.minimumBalance)) {
      throw new HttpException(
        'Insufficient token balance',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  generateJWT(walletAddress: string): string {
    // Use the JwtService to generate a JWT
    return this.jwtService.sign({ walletAddress });
  }
}
