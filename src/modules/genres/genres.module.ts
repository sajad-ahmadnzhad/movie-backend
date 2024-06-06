import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Genre, GenreSchema } from './schemas/Genre.schema';
import { User, UserSchema } from '../users/schemas/User.schema';
import { BanUser, BanUserSchema } from '../users/schemas/BanUser.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Genre.name, schema: GenreSchema },
      { name: User.name, schema: UserSchema },
      { name: BanUser.name, schema: BanUserSchema },
    ]),
  ],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
