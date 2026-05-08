import * as common from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { PurchaseTokensDto } from './dto/spend-tokens.dto';
import { SpendTokensDto } from './dto/spend-tokens.dto';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@common.Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /payments/membership — Inicia el pago de una membresía
  // Devuelve el clientSecret que el frontend usa con Stripe.js para cobrar la tarjeta
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Post('membership')
  @ApiOperation({ summary: 'Iniciar pago de membresía con Stripe' })
  createMembershipPayment(@common.Body() dto: PurchaseMembershipDto) {
    return this.paymentsService.createMembershipPaymentIntent(
      dto.userId,
      dto.membershipId,
    );
  }

  // POST /payments/membership/renew — Renovar una membresía existente
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Post('membership/renew')
  @ApiOperation({
    summary: 'Renovar membresía con Stripe (extiende o crea nueva)',
  })
  renewMembership(@common.Body() dto: RenewMembershipDto) {
    return this.paymentsService.createMembershipRenewalIntent(
      dto.userId,
      dto.membershipId,
    );
  }

  // POST /payments/tokens — Inicia la compra de un paquete de tokens
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Post('tokens')
  @ApiOperation({ summary: 'Iniciar compra de paquete de tokens con Stripe' })
  createTokenPurchase(@common.Body() dto: PurchaseTokensDto) {
    return this.paymentsService.createTokenPurchaseIntent(
      dto.userId,
      dto.packageId,
    );
  }

  // POST /payments/tokens/spend — Gasta tokens internamente (sin Stripe)
  // Ejemplo: reservar una clase especial que cuesta 50 tokens
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Post('tokens/spend')
  @ApiOperation({ summary: 'Gastar tokens en la app (reservas, etc.)' })
  spendTokens(@common.Body() dto: SpendTokensDto) {
    return this.paymentsService.spendTokens(
      dto.userId,
      dto.amount,
      dto.description,
    );
  }

  // GET /payments/history/:userId — Historial de transacciones del usuario
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Get('history/:userId')
  @ApiOperation({ summary: 'Ver historial de transacciones de un usuario' })
  getHistory(@common.Param('userId', common.ParseUUIDPipe) userId: string) {
    return this.paymentsService.getUserTransactions(userId);
  }

  // GET /payments/status/:userId — Estado de membresía y tokens
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @common.Get('status/:userId')
  @ApiOperation({
    summary: 'Obtener estado de membresía activa y balance de tokens',
  })
  getMembershipStatus(
    @common.Param('userId', common.ParseUUIDPipe) userId: string,
  ) {
    return this.paymentsService.getUserMembershipStatus(userId);
  }

  @common.Post('webhook')
  @ApiOperation({ summary: 'Webhook de Stripe (no llamar manualmente)' })
  handleWebhook(
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Headers('stripe-signature') signature: string,
  ) {
    // req.rawBody es el buffer original antes de que NestJS lo parsee
    if (!req.rawBody) {
      throw new common.BadRequestException('Raw body is required for webhook');
    }
    return this.paymentsService.handleStripeWebhook(req.rawBody, signature);
  }
}
