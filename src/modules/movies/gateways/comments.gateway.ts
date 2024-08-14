import {
  forwardRef,
  Inject,
  UseFilters,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AllExceptionsFilter } from "../../../common/filters/wsException.filter";
import { WsJwtGuard } from "../../../common/guards/wsJwt.guard";
import { WsValidationPipe } from "../../../common/pipes/wsValidation.pipe";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "../entities/comment.entity";
import { Repository } from "typeorm";
import { MoviesService } from "../services/movies.service";

@WebSocketGateway(81, { cors: { origin: "*" } })
export class CommentsGateway {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage("addComment")
  @UseGuards(WsJwtGuard)
  @UseFilters(AllExceptionsFilter)
  @UsePipes(WsValidationPipe)
  async handleAddComment(
    @MessageBody() createCommentDto: CreateCommentDto
  ): Promise<void> {
    const { movieId, rating, body } = createCommentDto;

    const existingMovie = await this.moviesService.checkExistMovieById(movieId);

    let newComment = this.commentRepository.create({
      body,
      rating,
      movie: existingMovie,
    });

    newComment = await this.commentRepository.save(newComment);

    this.server.emit("commentAdded", newComment);
  }
}
