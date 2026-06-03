import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { UpdateTeacherDto } from './dto/updateTeacher.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllTeachers(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.teacherService.getAllTeachers(validPage, validLimit);
  }

  @Get('nameAndImg')
  getNameAndImg() {
    return this.teacherService.getNameAndImg();
  }

  @Get('email')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByEmail(@Query() email: GetByEmailDto) {
    return this.teacherService.getByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  getTeacherById(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.getTeacherById(id);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  updateTeacher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newTeacherData: UpdateTeacherDto,
  ) {
    return this.teacherService.updateTeacher(id, newTeacherData);
  }

  @Put('promote/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  promoteTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.promoteTeacher(id);
  }

  @Put('demote/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  demoteTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.demoteTeacher(id);
  }

  @Put('inactive/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  inactiveTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.inactiveTeacher(id);
  }
}
