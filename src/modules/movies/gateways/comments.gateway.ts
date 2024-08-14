import { UseFilters, UseGuards, UsePipes } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { AllExceptionsFilter } from "../../../common/filters/wsException.filter";
import { WsJwtGuard } from "../../../common/guards/wsJwt.guard";
import { WsValidationPipe } from "../../../common/pipes/wsValidation.pipe";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "../entities/comment.entity";
import { Repository } from "typeorm";
import { Movie } from "../entities/movie.entity";
import {
  CommentsMessages,
  MoviesMessages,
} from "../../../common/enums/moviesMessages.enum";
import { RemoveCommentDto } from "../dto/comments/remove-comment.dto";
import { User } from "../../auth/entities/user.entity";
import { Roles } from "../../../common/enums/roles.enum";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";

@WebSocketGateway(81, { cors: { origin: "*" } })
@UseGuards(WsJwtGuard)
@UseFilters(AllExceptionsFilter)
@UsePipes(WsValidationPipe)
export class CommentsGateway {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage("addComment")
  async handleAddComment(
    @MessageBody() createCommentDto: CreateCommentDto & { user: User }
  ): Promise<void> {
    const { movieId, rating, body, user } = createCommentDto;

    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
      relations: {
        createdBy: true,
      },
    });

    if (!movie) {
      throw new WsException(MoviesMessages.NotFoundMovie);
    }

    const isAdminMovie = movie.createdBy.id == user.id;

    let newComment = this.commentRepository.create({
      creator: user,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      body,
      movie,
      rating,
    });

    newComment = await this.commentRepository.save(newComment);

    this.server.emit("commentAdded", newComment);
  }

  @SubscribeMessage("removeComment")
  async handleRemoveComment(
    @MessageBody() removeCommentDto: RemoveCommentDto & { user: User }
  ): Promise<void> {
    const { commentId, user } = removeCommentDto;

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        creator: user,
      },
      relations: { movie: { createdBy: true }, creator: true },
    });

    if (!comment) {
      throw new WsException(CommentsMessages.NotFoundComment);
    }

    if (user.id !== comment.movie.createdBy.id)
      if (user.id !== comment.creator.id && user.role !== Roles.SUPER_ADMIN) {
        throw new WsException(CommentsMessages.CannotAcceptComment);
      }

    await this.commentRepository.delete({ id: comment.id });

    this.server.emit("removedComment", { commentId: comment.id });
  }
}
