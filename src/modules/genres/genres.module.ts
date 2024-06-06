import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Genre, GenreSchema } from './schemas/Genre.schema';
import { User, UserSchema } from '../users/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Genre.name, schema: GenreSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
