import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';

// Assuming there's a JwtAuthGuard in auth module, but for simplicity, we'll just require the body
// You might want to protect this with an actual guard in a real scenario
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('charge')
  async charge(
    @Body('tokenId') tokenId: string,
    @Body('amount') amount: number,
    @Body('email') email: string,
    @Body('userId') userId: number // For simplicity, we are passing userId in body. Usually it comes from req.user
  ) {
    return this.paymentsService.processCharge(userId, tokenId, amount, email);
  }
}
