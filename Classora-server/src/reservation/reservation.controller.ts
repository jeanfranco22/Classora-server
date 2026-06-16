import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Roles(Role.STUDENT, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('reserve')
  @HttpCode(201)
  reserve_a_class(
    @Req() req: AuthenticatedRequest,
    @Query('id_class_schedule', ParseUUIDPipe) id_class_schedule: string,
  ) {
    const id_user = req.user.id;
    return this.reservationService.reserve(id_user, id_class_schedule);
  }

  @UseGuards(JwtAuthGuard)
  @Put('cancel/:id')
  @HttpCode(200)
  cancel_a_reserve_class(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.reservationService.cancel_reserve_class(id, userId);
  }

  // GET 'all' debe ir ANTES de GET ':id'
  // NestJS evalúa rutas en orden de declaración — si ':id' va primero,
  // el string 'all' se interpreta como un UUID y falla con ParseUUIDPipe
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  @HttpCode(200)
  get_all_reservations() {
    return this.reservationService.get_reservations();
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('coach/:coachId')
  get_reservations_by_coach(@Param('coachId', ParseUUIDPipe) coachId: string) {
    return this.reservationService.get_reservations_by_coach(coachId);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get(':id')
  @HttpCode(200)
  get_history_reserves_by_id(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.get_reserves_by_id(id);
  }
}
