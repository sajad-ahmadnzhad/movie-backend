import { Injectable } from "@nestjs/common";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";
import { User } from "../users/schemas/User.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Genre } from "./schemas/Genre.schema";
import { Model } from "mongoose";
import { GenresMessages } from "../../common/enum/genresMessages.enum";
import { sendError } from "../../common/utils/functions.util";

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>
  ) {}
  async create(createGenreDto: CreateGenreDto, user: User): Promise<string> {
    try {
      await this.genreModel.create({
        ...createGenreDto,
        createdBy: user._id,
      });

      return GenresMessages.CreatedGenreSuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }
  findAll() {
    return this.genreModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} genre`;
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
