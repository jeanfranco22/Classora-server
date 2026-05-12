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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { CompleteProfileDto } from 'src/auth/dto/completeProfile.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/auth-request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllUsers(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.usersService.getAllUsers(validPage, validLimit);
  }

  @Get('email')
  @Roles(Role.Admin, Role.Coach)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByEmail(@Query() email: GetByEmailDto) {
    return this.usersService.getByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newUserData: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, newUserData);
  }

  @Put('promote/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  promoteUserToAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.promoteUserToAdmin(id);
  }

  @Put('inactive/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  inactiveUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.inactiveUser(id);
  }
  // completa perfil incompleto
  @Patch('complete-profile')
  @UseGuards(JwtAuthGuard)
  completeProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    const userId = req.user.id;
    return this.usersService.completeGoogleProfile(userId, dto);
  }

  @Put('active/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activateUser(id);
  }
}
