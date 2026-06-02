import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenPackage } from './token-package.entity';
import { TokenPackageService } from './token-package.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenPackage])],
  providers: [TokenPackageService],
  exports: [TokenPackageService],
})
export class TokenPackageModule {}
