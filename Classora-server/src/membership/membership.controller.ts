import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// @ApiTags agrupa las rutas bajo "Membresías" en la documentación Swagger
@ApiTags('Memberships')
@Controller('memberships')
export class MembershipController {
  // NestJS inyecta automáticamente el servicio gracias al sistema de DI
  constructor(private readonly membershipService: MembershipService) {}

  // POST /memberships — Crea un nuevo tipo de membresía
  // (en producción aquí irá un guard de admin)
  @ApiBearerAuth()
  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear nuevo tipo de membresía (Admin)' })
  create(@Body() dto: CreateMembershipDto) {
    return this.membershipService.create(dto);
  }

  // GET /memberships — Devuelve todos los planes activos (para usuarios)
  @Get()
  @ApiOperation({ summary: 'Listar membresías activas disponibles' })
  findAllActive() {
    return this.membershipService.findAllActive();
  }

  // GET /memberships/admin — Devuelve TODOS los planes incluyendo inactivos
  @ApiBearerAuth()
  @Get('admin')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar todas las membresías (Admin)' })
  findAll() {
    return this.membershipService.findAll();
  }

  // GET /memberships/:id — Obtiene el detalle de una membresía
  // ParseUUIDPipe valida que el parámetro sea un UUID válido antes de entrar al servicio
  @Get(':id')
  @ApiOperation({ summary: 'Obtener membresía por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.findOne(id);
  }

  // PATCH /memberships/:id — Actualiza parcialmente una membresía
  // PATCH = actualización parcial (solo los campos que envíes), a diferencia de PUT que reemplaza todo
  @ApiBearerAuth()
  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar membresía (Admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.membershipService.update(id, dto);
  }

  // DELETE /memberships/:id — Desactiva la membresía (no la borra físicamente)
  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Desactivar membresía (Admin)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.deactivate(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('active/:id')
  activateMembership(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.activateMembership(id);
  }
}
