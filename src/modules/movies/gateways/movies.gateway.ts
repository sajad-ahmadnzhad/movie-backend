import { UseFilters, UseGuards, UsePipes } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { WsJwtGuard } from "../../../common/guards/wsJwt.guard";
import { WsValidationPipe } from "../../../common/pipes/wsValidation.pipe";
import { AllExceptionsFilter } from "../../../common/filters/wsException.filter";
import { LikeToggleDto } from "../dto/movies/likeToggle.dto";
import { Server } from "socket.io";
import { User } from "../../auth/entities/user.entity";
import { Repository } from "typeorm";
import { Like } from "../entities/like.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Movie } from "../entities/movie.entity";
import { MoviesMessages } from "../../../common/enums/moviesMessages.enum";

@WebSocketGateway({ cors: { origin: "*" } })
export class MoviesGateway {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>
  ) {}

  @WebSocketServer() server: Server;

  @UseGuards(WsJwtGuard)
  @UseFilters(AllExceptionsFilter)
  @UsePipes(WsValidationPipe)
  @SubscribeMessage("likeToggle")
  async handleLike(
    @MessageBody() likeDto: LikeToggleDto & { user: User }
  ): Promise<void> {
    const { updateLikes } = await this.likeMovie(likeDto.movieId, likeDto.user);
    this.server.emit("updateLikes", updateLikes);
  }

  async likeMovie(
    movieId: number,
    user: User
  ): Promise<{ updateLikes: number }> {
    const movie = await this.moviesRepository.findOne({
      where: { id: movieId },
      relations: { likes: true },
    });

    if (!movie) {
      throw new WsException(MoviesMessages.NotFoundMovie);
    }

    const likedMovie = await this.likeRepository
      .createQueryBuilder("like")
      .where("like.movie.id = :movieId", { movieId: movie.id })
      .andWhere("like.user.id = :userId", { userId: user.id })
      .getOne();

    if (likedMovie) {
      await this.likeRepository.remove(likedMovie);
      return { updateLikes: --movie.likesCount };
    }

    const like = this.likeRepository.create({ movie, user });

    await this.likeRepository.save(like);

    return {
      updateLikes: ++movie.likesCount,
    };
  }
}
