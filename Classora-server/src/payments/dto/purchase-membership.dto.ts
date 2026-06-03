import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PurchaseMembershipDto {
  // @IsUUID valida que el string tenga formato de UUID válido (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-de-la-membresia' })
  @IsUUID()
  @IsNotEmpty()
  membershipId: string;
}
