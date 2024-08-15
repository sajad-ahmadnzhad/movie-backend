import { UseFilters, UseGuards, UsePipes } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  WsException,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
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
import { pagination } from "../../../common/utils/pagination.util";
import { MovieCommentDto } from "../dto/comments/movie-comments.dto";

@WebSocketGateway(81, { cors: { origin: "*" } })
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
  @UseGuards(WsJwtGuard)
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

  @UseGuards(WsJwtGuard)
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("updateComment")
  async handleUpdateComment(
    @MessageBody() updateCommentDto: UpdateCommentDto & { user: User }
  ) {
    const { commentId, body, rating, user } = updateCommentDto;
    console.log(updateCommentDto);
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
        throw new WsException(CommentsMessages.CannotUpdateComment);
      }

    const isAdminMovie = comment.movie.createdBy.id == user.id;
    const isSuperAdmin = user.role == Roles.SUPER_ADMIN;

    const updatedComment = await this.commentRepository.update(
      { id: commentId },
      {
        body,
        rating,
        isAccept: isAdminMovie || isSuperAdmin,
        isEdit: true,
      }
    );

    this.server.emit("UpdatedComment", updatedComment);
  }

  @SubscribeMessage("getMovieComments")
  async handleAcceptComment(
    @MessageBody() movieCommentDto: MovieCommentDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { limit, page, movieId } = movieCommentDto;

    const movie = await this.movieRepository.findOneBy({ id: movieId });

    if (!movie) {
      throw new WsException(MoviesMessages.NotFoundMovie);
    }

    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect(
        "comment.replies",
        "replies",
        "replies.isAccept = :isAccept",
        { isAccept: true }
      )
      .leftJoin("comment.creator", "creator")
      .addSelect([
        "creator.id",
        "creator.name",
        "creator.avatarURL",
        "creator.username",
      ])
      .leftJoin("replies.creator", "replyCreator")
      .addSelect([
        "replyCreator.id",
        "replyCreator.name",
        "replyCreator.avatarURL",
        "replyCreator.username",
      ])
      .leftJoinAndSelect("comment.movie", "movie")
      .leftJoinAndSelect("comment.parent", "parent")
      .where("comment.isAccept = :isAccept", { isAccept: true })
      .andWhere("comment.movie.id = :movieId", { movieId })
      .orderBy("comment.createdAt", "DESC")
      .getMany();

    const paginatedComments = pagination(limit, page, comments);

    client.emit("movieComments", paginatedComments);
  }

  @SubscribeMessage("getUnacceptedComments")
  @UseGuards(WsJwtGuard)
  async handleUnacceptedComments(
    @MessageBody() movieCommentDto: MovieCommentDto & { user: User },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { limit, page, movieId, user } = movieCommentDto;

    const movie = await this.movieRepository.findOneBy({ id: movieId });

    if (!movie) {
      throw new WsException(MoviesMessages.NotFoundMovie);
    }

    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect(
        "comment.replies",
        "replies",
        "replies.isAccept = :isAccept",
        { isAccept: false }
      )
      .leftJoin("comment.creator", "creator")
      .addSelect([
        "creator.id",
        "creator.name",
        "creator.avatarURL",
        "creator.username",
      ])
      .leftJoin("replies.creator", "replyCreator")
      .addSelect([
        "replyCreator.id",
        "replyCreator.name",
        "replyCreator.avatarURL",
        "replyCreator.username",
      ])
      .leftJoinAndSelect("comment.movie", "movie")
      .leftJoinAndSelect("comment.parent", "parent")
      .where("comment.isAccept = :isAccept", { isAccept: false })
      .andWhere("comment.isReject = :isReject", { isReject: false })
      .andWhere("movie.createdBy.id = :createdById", {
        createdById: user.id,
      })
      .orderBy("comment.isReviewed", "ASC")
      .addOrderBy("comment.createdAt", "DESC")
      .getMany();

    const paginatedComments = pagination(limit, page, comments);

    client.emit("unacceptedComments", paginatedComments);
  }
}
