import { Inject, UseFilters, UseGuards, UsePipes } from "@nestjs/common";
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
import { ReviewCommentDto } from "../dto/comments/review-comment.dto";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { AcceptCommentDto } from "../dto/comments/accept-comment.dto";
import { RejectCommentDto } from "../dto/comments/reject-comment.dto";
import { RoleGuard } from "../../../common/guards/auth.guard";
import { Role } from "../../../common/decorators/role.decorator";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";

@WebSocketGateway(81, { cors: { origin: "*" } })
@UseFilters(AllExceptionsFilter)
@UsePipes(WsValidationPipe)
export class CommentsGateway {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
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

    const cacheKeys = [
      `getAllUnacceptedComments_${movieId}`,
      `getAllComments_${movieId}`,
    ];

    await this.removeCommentsFromCache(cacheKeys);

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

    const cacheKey = `getAllComments_${comment.movie.id}`

    await this.removeCommentsFromCache(cacheKey);

    this.server.emit("removedComment", { commentId: comment.id });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("updateComment")
  async handleUpdateComment(
    @MessageBody() updateCommentDto: UpdateCommentDto & { user: User }
  ) {
    const { commentId, body, rating, user } = updateCommentDto;

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

    const cacheKeys = [
      `getAllUnacceptedComments_${comment.movie.id}`,
      `getAllComments_${comment.movie.id}`,
    ];

    await this.removeCommentsFromCache(cacheKeys);

    this.server.emit("UpdatedComment", updatedComment);
  }

  @SubscribeMessage("getMovieComments")
  async handleGetMovieComments(
    @MessageBody() movieCommentDto: MovieCommentDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { limit, page, movieId } = movieCommentDto;

    const cacheKey = `getAllComments_${movieId}`;

    const commentsCache = await this.redisCache.get<Comment[]>(cacheKey);

    if (commentsCache) {
      const paginatedComments = pagination(limit, page, commentsCache);
      client.emit("movieComments", paginatedComments);
      return;
    }

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

    await this.redisCache.set(cacheKey, comments, 30_000);

    const paginatedComments = pagination(limit, page, comments);

    client.emit("movieComments", paginatedComments);
  }

  @SubscribeMessage("getUnacceptedComments")
  @UseGuards(WsJwtGuard, RoleGuard)
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  async handleGetUnacceptedComments(
    @MessageBody() movieCommentDto: MovieCommentDto & { user: User },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { limit, page, movieId, user } = movieCommentDto;

    const cacheKey = `getAllUnacceptedComments_${movieId}`;

    const commentsCache = await this.redisCache.get<Comment[]>(cacheKey);

    if (commentsCache) {
      const paginatedComments = pagination(limit, page, commentsCache);
      client.emit("unacceptedComments", paginatedComments);
      return;
    }

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

    await this.redisCache.set(cacheKey, comments, 30_000);

    const paginatedComments = pagination(limit, page, comments);

    client.emit("unacceptedComments", paginatedComments);
  }

  @SubscribeMessage("reviewComment")
  @UseGuards(WsJwtGuard, RoleGuard)
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  async handleReviewComment(
    @MessageBody() reviewCommentDto: ReviewCommentDto & { user: User },
    @ConnectedSocket() client: Socket
  ) {
    const { commentId, user } = reviewCommentDto;
    const comment = await this.commentRepository.findOneBy({
      id: commentId,
      movie: { createdBy: { id: user.id } },
    });

    if (!comment) {
      throw new WsException(CommentsMessages.NotFoundComment);
    }

    if (comment.isReviewed) {
      throw new WsException(CommentsMessages.AlreadyReviewedComment);
    }

    comment.isReviewed = true;

    await this.commentRepository.save(comment);

    client.emit("reviewedComment", comment);
  }

  @SubscribeMessage("replyComment")
  @UseGuards(WsJwtGuard)
  async handleReplyComment(
    @MessageBody() replyCommentDto: ReplyCommentDto & { user: User }
  ) {
    const { body, rating, user, commentId } = replyCommentDto;

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: {
        movie: true,
      },
    });

    if (!comment) {
      throw new WsException(CommentsMessages.NotFoundComment);
    }

    if (!comment.isAccept) {
      throw new WsException(CommentsMessages.NotAcceptedComment);
    }

    const movie = await this.movieRepository.findOne({
      where: { id: comment.movie.id },
      relations: { createdBy: true },
    });

    if (!movie) throw new WsException(MoviesMessages.NotFoundMovie);

    const isAdminMovie = movie.createdBy.id == user.id;

    const reply = this.commentRepository.create({
      body,
      rating,
      parent: comment,
      creator: user,
      movie,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
    });

    const repliedComment = await this.commentRepository.save(reply);

    const cacheKeys = [
      `getAllUnacceptedComments_${comment.movie.id}`,
      `getAllComments_${comment.movie.id}`,
    ];

    await this.removeCommentsFromCache(cacheKeys);

    this.server.emit("repliedComment", repliedComment);
  }

  @SubscribeMessage("acceptComment")
  @UseGuards(WsJwtGuard, RoleGuard)
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  async handleAcceptComment(
    @MessageBody() acceptCommentDto: AcceptCommentDto & { user: User },
    @ConnectedSocket() client: Socket
  ) {
    const { commentId, user } = acceptCommentDto;

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { movie: { createdBy: true } },
    });

    if (!comment) {
      throw new WsException(CommentsMessages.NotFoundComment);
    }

    if (comment.isAccept) {
      throw new WsException(CommentsMessages.AlreadyAcceptedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new WsException(CommentsMessages.CannotAcceptComment);
    }

    await this.commentRepository.update(
      {
        id: commentId,
      },
      { isReject: false, isAccept: true }
    );

    const cacheKeys = [
      `getAllUnacceptedComments_${comment.movie.id}`,
      `getAllComments_${comment.movie.id}`,
    ];

    await this.removeCommentsFromCache(cacheKeys);

    client.emit("acceptedComment", comment);
  }

  @SubscribeMessage("rejectComment")
  @UseGuards(WsJwtGuard, RoleGuard)
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  async handleRejectComment(
    @MessageBody() rejectCommentDto: RejectCommentDto & { user: User },
    @ConnectedSocket() client: Socket
  ) {
    const { commentId, user } = rejectCommentDto;

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { movie: { createdBy: true } },
    });

    if (!comment) {
      throw new WsException(CommentsMessages.NotFoundComment);
    }

    if (comment.isReject) {
      throw new WsException(CommentsMessages.AlreadyRejectedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new WsException(CommentsMessages.CannotRejectComment);
    }

    comment.isAccept = false;
    comment.isReject = true;

    await this.commentRepository.update(
      {
        id: commentId,
      },
      { isReject: true, isAccept: false }
    );

    const cacheKeys = [
      `getAllUnacceptedComments_${comment.movie.id}`,
      `getAllComments_${comment.movie.id}`,
    ];

    await this.removeCommentsFromCache(cacheKeys);

    client.emit("rejectedComment", comment);
  }

  async removeCommentsFromCache(cacheKey: string | string[]): Promise<void> {
    if (typeof cacheKey == "string") {
      await this.redisCache.del(cacheKey);
    } else if (typeof cacheKey == "object") {
      const promisesKey = cacheKey.map((key) => this.redisCache.del(key));

      await Promise.all(promisesKey);
    }
  }
}
