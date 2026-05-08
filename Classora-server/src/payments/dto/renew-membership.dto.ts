// ─── renew-membership.dto.ts ──────────────────────────────────────────────────
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

// DTO para cuando un usuario quiere renovar su membresía vencida o próxima a vencer
export class RenewMembershipDto {
  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-de-la-membresia-a-renovar' })
  @IsUUID()
  @IsNotEmpty()
  membershipId: string;
}
