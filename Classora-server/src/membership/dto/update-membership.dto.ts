import { PartialType } from '@nestjs/swagger';
import { CreateMembershipDto } from './create-membership.dto';

// Si envías solo { price: 39.99 }, solo actualiza el precio y deja todo lo demás igual
export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {}
