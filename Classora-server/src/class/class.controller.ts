import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('clases')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('/')
  @HttpCode(200)
  get_all_classes() {
    return this.classService.get_classes();
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  @HttpCode(200)
  get_all_classes_admin() {
    return this.classService.get_all_classes();
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create')
  @HttpCode(201)
  create_new_class(@Body() clase: CreateClass) {
    return this.classService.create_new_class(clase);
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @HttpCode(200)
  update_a_class(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() clase: UpdateClass,
  ) {
    return this.classService.update_class(id, clase);
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('delete/:id')
  @HttpCode(200)
  delete_a_class(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete_class(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('active/:id')
  activeClass(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.activeClass(id);
  }

  // SUBIR IMAGEN DE CLASE (Cloudinary)
  @ApiBearerAuth()
  @Roles(Role.Coach, Role.Admin)
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
            new BadRequestException('Formato de imagen invÃ¡lido'),
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
