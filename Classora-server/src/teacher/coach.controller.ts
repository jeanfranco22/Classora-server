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
import { CoachService } from './coach.service';
import { UpdateCoachDto } from './dto/updateCoach.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OwnerOrAdminGuard } from 'src/auth/guards/ownership.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllCoaches(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.coachService.getAllCoaches(validPage, validLimit);
  }

  @Get('nameAndImg')
  getNameAndImg() {
    return this.coachService.getNameAndImg();
  }

  @Get('email')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByEmail(@Query() email: GetByEmailDto) {
    return this.coachService.getByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  getCoachById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.getCoachById(id);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  updateCoach(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newCoachData: UpdateCoachDto,
  ) {
    return this.coachService.updateCoach(id, newCoachData);
  }

  @Put('promote/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  promoteCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.promoteCoach(id);
  }

  @Put('demote/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  demoteCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.demoteCoach(id);
  }

  @Put('inactive/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  inactiveCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.inactiveCoach(id);
  }
}
