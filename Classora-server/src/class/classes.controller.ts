import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { Role } from 'src/common/roles.enum';
import { ClassService } from './class.service';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @HttpCode(200)
  getActiveClasses() {
    return this.classService.get_classes();
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  @HttpCode(200)
  getAllClasses() {
    return this.classService.get_all_classes();
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('teacher/me')
  @HttpCode(200)
  getCurrentTeacherClasses(@Req() req: AuthenticatedRequest) {
    return this.classService.get_teacher_classes(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(201)
  createClass(@Body() dto: CreateClass, @Req() req: AuthenticatedRequest) {
    return this.classService.create_new_class(dto, req.user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @HttpCode(200)
  updateClass(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClass,
  ) {
    return this.classService.update_class(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/inactive')
  @HttpCode(200)
  inactiveClass(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete_class(id);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/active')
  activeClass(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.activeClass(id);
  }

  @ApiBearerAuth()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
        if (!ok) {
          return cb(
            new BadRequestException('Formato de imagen invalido'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @HttpCode(200)
  uploadClassImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe enviar una imagen');
    }

    return this.classService.uploadClassImage(id, file);
  }
}
