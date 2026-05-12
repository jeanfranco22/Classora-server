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
import { ClassScheduleService } from './class_schedule.service';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('class_schedule')
export class ClassesScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @ApiBearerAuth()
  @Roles(Role.User, Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('history')
  @HttpCode(200)
  classes_user_history() {
    return this.classScheduleService.classes_history();
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('appointment')
  @HttpCode(201)
  class_appointment_reserve(
    @Body() clase_app: CreateClassSchedule,
    @Query('id_class', ParseUUIDPipe) id_class: string,
    @Req() req: Request & { user: JwtPayload }, // Intersección de tipos
  ) {
    const user = req.user; // Ahora 'user' es de tipo JwtPayload y tiene 'sub', 'email', 'role'

    return this.classScheduleService.class_appointment(
      clase_app,
      id_class,
      user,
    );
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('cancel/:id')
  @HttpCode(200)
  class_appointment_cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.classScheduleService.class_appmnt_cancel(id);
  }
}
