import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { MoviesService } from "./movies.service";
import { CommentsMessages } from "../../../common/enums/moviesMessages.enum";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";
import {
  cachePagination,
  typeormQueryBuilderPagination,
} from "../../../common/utils/pagination.util";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "../entities/comment.entity";
import { Repository } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Roles } from "../../../common/enums/roles.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";

@Injectable()
export class CommentsService {
  constructor(
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    user: User
  ): Promise<string> {
    const { body, rating, movieId } = createCommentDto;

    const movie = await this.moviesService.checkExistMovieById(movieId);

    const isAdminMovie = movie.createdBy.id == user.id;

    const comment = this.commentRepository.create({
      creator: user,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      body,
      movie,
      rating,
    });

    await this.commentRepository.save(comment);

    return CommentsMessages.CreatedCommentSuccess;
  }

  async reply(
    id: number,
    replyCommentDto: ReplyCommentDto,
    user: User
  ): Promise<string> {
    const existingComment = await this.checkExistCommentById(id);

    if (!existingComment.isAccept) {
      throw new ConflictException(CommentsMessages.NotAcceptedComment);
    }

    const movie = await this.moviesService.checkExistMovieById(
      existingComment.movie.id
    );

    const isAdminMovie = movie.createdBy.id == user.id;

    const reply = this.commentRepository.create({
      ...replyCommentDto,
      parent: existingComment,
      creator: user,
      movie,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
    });

    await this.commentRepository.save(reply);

    return CommentsMessages.ReplyCommentSuccess;
  }

  async accept(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (comment.isAccept) {
      throw new ConflictException(CommentsMessages.AlreadyAcceptedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new ForbiddenException(CommentsMessages.CannotAcceptComment);
    }

    await this.commentRepository.update(
      { id },
      { isReject: false, isAccept: true }
    );

    return CommentsMessages.AcceptedCommentSuccess;
  }

  async reject(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (comment.isReject) {
      throw new ConflictException(CommentsMessages.AlreadyRejectedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new ForbiddenException(CommentsMessages.CannotRejectComment);
    }

    await this.commentRepository.update(
      { id },
      {
        isReject: true,
        isAccept: false,
      }
    );

    return CommentsMessages.RejectedCommentSuccess;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: User
  ): Promise<string> {
    const { body, rating } = updateCommentDto;

    const comment = await this.checkExistCommentById(id);

    if (user.id !== comment.movie.createdBy.id)
      if (user.id !== comment.creator.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(CommentsMessages.CannotUpdateComment);
      }

    const isAdminMovie = comment.movie.createdBy.id == user.id;
    const isSuperAdmin = user.role == Roles.SUPER_ADMIN;

    await this.commentRepository.update(
      { id },
      {
        body,
        rating,
        isAccept: isAdminMovie || isSuperAdmin,
        isEdit: true,
      }
    );

    return CommentsMessages.UpdatedCommentSuccess;
  }

  async getMovieComments(
    movieId: number,
    limit: number,
    page: number
  ): Promise<PaginatedList<Comment>> {
    await this.moviesService.checkExistMovieById(movieId);

    const redisKey = `Comments_movie_${movieId}`;

    const cachePaginated = await this.redisCache.get<Comment[] | undefined>(
      redisKey
    );

    if (cachePaginated) {
      return cachePagination(limit, page, cachePaginated);
    }

    const qb = this.commentRepository
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
      .orderBy("comment.createdAt", "DESC");

    const comments = await qb.getMany();
    await this.redisCache.set(redisKey, comments, 30_000);

    const commentPaginated = await typeormQueryBuilderPagination(
      limit,
      page,
      this.commentRepository,
      qb
    );

    return commentPaginated;
  }

  async getUnacceptedComments(
    user: User,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Comment>> {
    const redisKey = `UnacceptedComment`;

    const cachePaginated = await this.redisCache.get<Comment[] | undefined>(
      redisKey
    );

    if (cachePaginated) {
      return cachePagination(limit, page, cachePaginated);
    }

    const qb = this.commentRepository
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
      .andWhere("movie.createdBy.id = :createdById", { createdById: user.id })
      .orderBy("comment.isReviewed", "ASC")
      .addOrderBy("comment.createdAt", "DESC");

    const comments = await qb.getMany();
    await this.redisCache.set(redisKey, comments, 30_000);

    const commentPaginated = await typeormQueryBuilderPagination(
      limit,
      page,
      this.commentRepository,
      qb
    );

    return commentPaginated;
  }

  async remove(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (user.id !== comment.movie.createdBy.id)
      if (user.id !== comment.creator.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(CommentsMessages.CannotRemoveComment);
      }

    await this.commentRepository.delete({ id });

    return CommentsMessages.RemovedCommentSuccess;
  }

  async markAsReviewed(id: number, user: User) {
    const comment = await this.commentRepository.findOneBy({
      id,
      movie: { createdBy: { id: user.id } },
    });

    if (!comment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    if (comment.isReviewed) {
      throw new ConflictException(CommentsMessages.AlreadyReviewedComment);
    }

    comment.isReviewed = true;

    await this.commentRepository.save(comment);

    return CommentsMessages.ReviewedCommentSuccess;
  }

  async checkExistCommentById(id: number): Promise<Comment> {
    const existingComment = await this.commentRepository.findOne({
      where: { id },
      relations: {
        movie: {
          createdBy: true,
        },
        creator: true,
      },
    });

    if (!existingComment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    return existingComment;
  }
}
