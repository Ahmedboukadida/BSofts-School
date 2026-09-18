import { Module } from '@nestjs/common';
import { MatieresService } from './matieres.service';
import { MatieresController } from './matieres.controller';

@Module({
  controllers: [MatieresController],
  providers: [MatieresService],
  exports: [MatieresService],
})
export class MatieresModule {}
