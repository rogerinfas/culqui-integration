import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async processCharge(userId: number, tokenId: string, amount: number, email: string) {
    const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;
    if (!CULQI_SECRET_KEY) {
      throw new HttpException('Culqi secret key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // 1. Create a charge using Culqi API
      const response = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount: amount,
          currency_code: 'PEN',
          email: email,
          source_id: tokenId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.user_message || 'Error processing payment with Culqi',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Save the successful charge in the database
      const payment = await this.prisma.payment.create({
        data: {
          amount,
          currency: 'PEN',
          chargeId: data.id,
          status: data.outcome?.type || 'success',
          userId,
        },
      });

      return {
        message: 'Payment processed successfully',
        payment,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error during payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
