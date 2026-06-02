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
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { Role } from 'src/common/roles.enum';
import { ReservationService } from './reservation.service';

@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(201)
  createReservation(
    @Req() req: AuthenticatedRequest,
    @Query('classScheduleId', ParseUUIDPipe) classScheduleId: string,
  ) {
    return this.reservationService.reserve(req.user.id, classScheduleId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  @HttpCode(200)
  cancelReservation(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationService.cancel_reserve_class(id, req.user.id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(200)
  getAllReservations() {
    return this.reservationService.get_reservations();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(200)
  getCurrentStudentReservations(@Req() req: AuthenticatedRequest) {
    return this.reservationService.get_reserves_by_id(req.user.id);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('teacher/me')
  getCurrentTeacherReservations(@Req() req: AuthenticatedRequest) {
    return this.reservationService.get_reservations_by_coach(req.user.id);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('teacher/:teacherId')
  getReservationsByTeacher(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    return this.reservationService.get_reservations_by_coach(teacherId);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get('student/:id')
  @HttpCode(200)
  getReservationsByStudent(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.get_reserves_by_id(id);
  }
}
