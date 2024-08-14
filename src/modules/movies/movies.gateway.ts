import {
  forwardRef,
  Inject,
  UseFilters,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { WsJwtGuard } from "../../common/guards/wsJwt.guard";
import { WsValidationPipe } from "../../common/pipes/wsValidation.pipe";
import { AllExceptionsFilter } from "../../common/filters/wsException.filter";
import { LikeToggleDto } from "./dto/gateways/likeToggle.dto";
import { Server } from "socket.io";
import { User } from "../auth/entities/user.entity";
import { MoviesService } from "./services/movies.service";
import { Repository } from "typeorm";
import { Like } from "./entities/like.entity";
import { InjectRepository } from "@nestjs/typeorm";

@WebSocketGateway(81, { cors: { origin: "*" } })
export class MoviesGateway {
  constructor(
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>
  ) {}

  @WebSocketServer() server: Server;

  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(AllExceptionsFilter)
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
    const movie = await this.moviesService.checkExistMovieById(movieId);

    const likedMovie = await this.likeRepository
      .createQueryBuilder("like")
      .where("like.movie.id = :movieId", { movieId: movie.id })
      .andWhere("like.user.id = :userId", { userId: user.id })
      .getOne();

    if (likedMovie) {
      await this.likeRepository.remove(likedMovie);
      return { updateLikes: movie.likesCount };
    }

    const like = this.likeRepository.create({ movie, user });

    await this.likeRepository.save(like);

    return {
      updateLikes: movie.likesCount,
    };
  }
}
