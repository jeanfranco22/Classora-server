import { PartialType } from '@nestjs/swagger';
import { CreateFAQDto } from './create-faq.dto';

// PartialType hace que todos los campos de CreateFAQDto sean opcionales
// Así puedes actualizar solo los campos que necesitamos
export class UpdateFAQDto extends PartialType(CreateFAQDto) {}
