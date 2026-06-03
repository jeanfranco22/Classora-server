import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CompleteProfileDto } from 'src/auth/dto/completeProfile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { Role } from 'src/common/roles.enum';
import { GetByEmailDto } from './dto/getByEmail.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllStudents(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.usersService.getAllUsers(validPage, validLimit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentStudent(@Req() req: AuthenticatedRequest) {
    return this.usersService.getUserById(req.user.id);
  }

  @Get('email')
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getStudentByEmail(@Query() email: GetByEmailDto) {
    return this.usersService.getByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  getStudentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  updateStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch('me/complete-profile')
  @UseGuards(JwtAuthGuard)
  completeCurrentStudentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.usersService.completeGoogleProfile(req.user.id, dto);
  }

  @Put(':id/inactive')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  inactiveStudent(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.inactiveUser(id);
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  activateStudent(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activateUser(id);
  }
}
