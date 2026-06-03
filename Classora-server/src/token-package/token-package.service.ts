import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenPackage } from './token-package.entity';

@Injectable()
export class TokenPackageService {
  constructor(
    @InjectRepository(TokenPackage)
    private readonly tokenPackageRepository: Repository<TokenPackage>,
  ) {}

  async findOne(id: string): Promise<TokenPackage> {
    const tokenPackage = await this.tokenPackageRepository.findOne({
      where: { id, isActive: true },
    });

    if (!tokenPackage) {
      throw new NotFoundException(`Token package with id ${id} not found`);
    }

    return tokenPackage;
  }
}
