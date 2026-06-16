import {
  Body,
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
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { Role } from 'src/common/roles.enum';
import { ClassScheduleService } from './class_schedule.service';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';

@Controller('class-schedules')
export class ClassSchedulesController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @ApiBearerAuth()
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(200)
  getClassSchedules(@Query('classId') classId?: string) {
    return this.classScheduleService.classes_history(classId);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('teacher/me')
  @HttpCode(200)
  getTeacherClassSchedules(@Req() req: AuthenticatedRequest) {
    return this.classScheduleService.classes_by_teacher(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(201)
  createClassSchedule(
    @Body() dto: CreateClassSchedule,
    @Query('classId', ParseUUIDPipe) classId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.classScheduleService.class_appointment(dto, classId, req.user);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/cancel')
  @HttpCode(200)
  cancelClassSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.classScheduleService.class_appmnt_cancel(id);
  }
}
